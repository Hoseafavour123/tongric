import { cookies } from "next/headers";
import { ZodError } from "zod";
import { created, handleApiError } from "@/lib/api-response";
import { assistedRegisterFarmer } from "@/modules/auth/auth.service";
import { requireRole } from "@/modules/auth/guards";
import type { RawRegisterInput } from "@/modules/auth/schemas";
import { LOCALE_COOKIE_NAME } from "@/modules/i18n/locale-cookie";

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
    const operator = await requireRole(["ADMIN"]);

    const rawBody = (await request.json().catch(() => {
      throw new ZodError([
        {
          code: "custom",
          path: [],
          message: "Request body must be valid JSON",
        },
      ]);
    })) as RawRegisterInput;

    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null;
    const ipAddress = extractClientIp(request);
    const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? null;

    const result = await assistedRegisterFarmer(operator, rawBody, {
      cookieLocale,
      ipAddress,
      userAgent,
    });

    return created(result);
  } catch (error) {
    return handleApiError(error);
  }
}

