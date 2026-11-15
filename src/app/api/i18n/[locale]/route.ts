import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { getDictionaryForLocale } from "@/modules/i18n/i18n.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ locale: string }> },
) {
  try {
    const { locale } = await context.params;
    const payload = await getDictionaryForLocale(locale);

    return NextResponse.json(
      { ok: true, data: payload },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

