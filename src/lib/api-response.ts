import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, type ErrorCode } from "./errors";

export interface ApiSuccessBody<T> {
  ok: true;
  data: T;
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiSuccessBody<T>> {
  return ok(data, 201);
}

export function fail(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  );
}

/**
 * Converts known AppError / ZodError instances into clean JSON responses and
 * shields internal details from clients in production.
 */
export function handleApiError(
  error: unknown,
  isProduction = process.env.NODE_ENV === "production",
): NextResponse<ApiErrorBody> {
  if (error instanceof AppError) {
    return fail(error.code, error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    return fail("VALIDATION_ERROR", "Validation failed", 400, {
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  console.error("[Tongric API Error]", error);

  const safeMessage =
    !isProduction && error instanceof Error
      ? error.message
      : "An unexpected server error occurred. Please try again.";

  return fail("INTERNAL_ERROR", safeMessage, 500);
}

