import { ZodError } from "zod";
import { handleApiError, ok } from "@/lib/api-response";
import { loginUser } from "@/modules/auth/auth.service";
import type { RawLoginInput } from "@/modules/auth/schemas";
import {
  buildSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/sessions";
import {
  buildLocaleCookieOptions,
  LOCALE_COOKIE_NAME,
} from "@/modules/i18n/locale-cookie";

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
    })) as RawLoginInput;

    const ipAddress = extractClientIp(request);
    const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? null;

    const result = await loginUser(rawBody, { ipAddress, userAgent });

    const response = ok({ user: result.user });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      result.token,
      buildSessionCookieOptions(result.expiresAt),
    );

    if (result.user.preferredLanguageCode) {
      response.cookies.set(
        LOCALE_COOKIE_NAME,
        result.user.preferredLanguageCode,
        buildLocaleCookieOptions(),
      );
    }

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

