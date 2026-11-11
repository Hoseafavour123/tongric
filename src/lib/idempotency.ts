const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

/**
 * Generates a unique idempotency key for mutation requests so explicit user
 * retries over unstable 2G/3G networks do not duplicate orders or listings.
 */
export function createIdempotencyKey(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `trg-${Date.now().toString(36)}-${randomPart}`;
}

/**
 * Extracts and validates an Idempotency-Key header from incoming HTTP requests.
 */
export function extractIdempotencyKey(headers: Headers): string | null {
  const raw = headers.get("Idempotency-Key")?.trim();
  if (!raw || !IDEMPOTENCY_KEY_PATTERN.test(raw)) {
    return null;
  }
  return raw;
}

