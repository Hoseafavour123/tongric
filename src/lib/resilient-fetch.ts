import { createIdempotencyKey } from "./idempotency";

export interface ResilientFetchOptions {
  method?: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: BodyInit | null;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  idempotencyKey?: string;
  fetchImpl?: typeof fetch;
}

export interface ResilientFetchSuccess<T> {
  ok: true;
  status: number;
  data: T;
  idempotencyKey?: string;
}

export interface ResilientFetchFailure {
  ok: false;
  status: number;
  canRetry: boolean;
  idempotencyKey?: string;
  error: {
    code: string;
    message: string;
  };
}

export type ResilientFetchResult<T> =
  | ResilientFetchSuccess<T>
  | ResilientFetchFailure;

const TRANSIENT_HTTP_STATUSES = new Set([502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSafeMethod(method: string): boolean {
  return method === "GET" || method === "HEAD";
}

/**
 * Network-resilient HTTP wrapper for low-connectivity Nigerian environments:
 * - Safe GET/HEAD calls automatically retry transient failures.
 * - Mutations (POST/PATCH/PUT/DELETE) attach a stable Idempotency-Key and
 *   surface retryable errors for explicit user retry rather than blind double-posting.
 */
export async function resilientFetch<T = unknown>(
  url: string,
  options: ResilientFetchOptions = {},
): Promise<ResilientFetchResult<T>> {
  const method = (options.method ?? "GET").toUpperCase();
  const safe = isSafeMethod(method);
  const maxRetries = safe ? (options.maxRetries ?? 2) : 0;
  const timeoutMs = options.timeoutMs ?? 15000;
  const retryDelayMs = options.retryDelayMs ?? 350;
  const fetchFn = options.fetchImpl ?? fetch;

  const idempotencyKey = !safe
    ? (options.idempotencyKey ?? createIdempotencyKey())
    : undefined;

  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  if (idempotencyKey && !headers["Idempotency-Key"]) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchFn(url, {
        method,
        headers,
        body: options.body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const parsed = isJson ? await response.json().catch(() => null) : null;

      if (response.ok) {
        const data =
          parsed && typeof parsed === "object" && "data" in parsed
            ? (parsed.data as T)
            : (parsed as T);
        return {
          ok: true,
          status: response.status,
          data,
          ...(idempotencyKey ? { idempotencyKey } : {}),
        };
      }

      const transient = TRANSIENT_HTTP_STATUSES.has(response.status);
      if (transient && attempt < maxRetries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      const apiError =
        parsed &&
        typeof parsed === "object" &&
        "error" in parsed &&
        parsed.error &&
        typeof parsed.error === "object"
          ? (parsed.error as { code?: string; message?: string })
          : null;

      return {
        ok: false,
        status: response.status,
        canRetry: transient || response.status >= 500 || response.status === 408,
        ...(idempotencyKey ? { idempotencyKey } : {}),
        error: {
          code: apiError?.code ?? "REQUEST_FAILED",
          message:
            apiError?.message ??
            (transient
              ? "Server temporarily unavailable. Please try again."
              : "Request could not be completed."),
        },
      };
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";

      if (attempt < maxRetries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      return {
        ok: false,
        status: 0,
        canRetry: true,
        ...(idempotencyKey ? { idempotencyKey } : {}),
        error: {
          code: isAbort ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          message: isAbort
            ? "Connection timed out. Please check your network and retry."
            : "Network connection lost. Please check your signal and retry.",
        },
      };
    }
  }

  return {
    ok: false,
    status: 0,
    canRetry: true,
    ...(idempotencyKey ? { idempotencyKey } : {}),
    error: {
      code: "NETWORK_ERROR",
      message: "Network request failed. Please retry.",
    },
  };
}

