import { ZodError } from "zod";
import { handleApiError, ok } from "@/lib/api-response";
import { recoverPassword } from "@/modules/auth/auth.service";
import type { RawRecoverInput } from "@/modules/auth/schemas";
import {
  buildClearSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/sessions";

function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();
    if (firstHop) {
      return firstHop.slice(0, 64);
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp ? realIp.slice(0, 64) : null;
}

export async function POST(request: Request) {
  try {
    const rawBody = (await request.json().catch(() => {
      throw new ZodError([
        {
          code: "custom",
          path: [],
          message: "Request body must be valid JSON",
        },
      ]);
    })) as RawRecoverInput;

    const ipAddress = extractClientIp(request);
    const result = await recoverPassword(rawBody, { ipAddress });

    const response = ok(result);
    // Revoke any stale session cookie on password reset
    response.cookies.set(
      SESSION_COOKIE_NAME,
      "",
      buildClearSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

