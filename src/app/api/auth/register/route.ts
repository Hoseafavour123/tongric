import { cookies } from "next/headers";
import { ZodError } from "zod";
import { created, handleApiError } from "@/lib/api-response";
import { registerUser } from "@/modules/auth/auth.service";
import type { RawRegisterInput } from "@/modules/auth/schemas";
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
    })) as RawRegisterInput;

    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      throw new ZodError([
        {
          code: "custom",
          path: [],
          message: "Request body must be a JSON object",
        },
      ]);
    }

    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null;
    const ipAddress = extractClientIp(request);
    const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? null;

    const result = await registerUser(rawBody, {
      cookieLocale,
      ipAddress,
      userAgent,
    });

    const response = created(result);
    response.cookies.set(
      LOCALE_COOKIE_NAME,
      result.user.preferredLanguageCode,
      buildLocaleCookieOptions(),
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

