import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/api-response";
import { getDictionaryForLocale } from "@/modules/i18n/i18n.service";
import {
  buildLocaleCookieOptions,
  LOCALE_COOKIE_NAME,
} from "@/modules/i18n/locale-cookie";

const setLanguageSchema = z.object({
  locale: z
    .string()
    .trim()
    .min(2, "Language code is required")
    .max(12, "Language code is too long"),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["locale"],
          message: "Request body must be valid JSON",
        },
      ]);
    });

    const { locale } = setLanguageSchema.parse(rawBody);
    const payload = await getDictionaryForLocale(locale);

    const response = NextResponse.json(
      { ok: true, data: payload },
      { status: 200 },
    );

    response.cookies.set(
      LOCALE_COOKIE_NAME,
      payload.locale,
      buildLocaleCookieOptions(),
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

