import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/lib/errors";
import { getDefaultDictionary } from "@/modules/i18n/base-dictionary";

const mockGetDictionaryForLocale = vi.fn();

vi.mock("@/modules/i18n/i18n.service", () => ({
  getDictionaryForLocale: (locale: string) => mockGetDictionaryForLocale(locale),
}));

import { GET } from "../[locale]/route";

describe("GET /api/i18n/[locale]", () => {
  it("returns 200 with cache headers for an active locale", async () => {
    mockGetDictionaryForLocale.mockResolvedValueOnce({
      locale: "tiv",
      fallbackLocale: "en",
      languages: [
        {
          code: "en",
          name: "English",
          nativeName: "English",
          isDefault: true,
          isPilotPriority: true,
          validatedCount: 60,
          totalKeyCount: 60,
        },
        {
          code: "tiv",
          name: "Tiv",
          nativeName: "Tiv",
          isDefault: false,
          isPilotPriority: true,
          validatedCount: 0,
          totalKeyCount: 60,
        },
      ],
      messages: getDefaultDictionary(),
    });

    const res = await GET(new Request("http://localhost/api/i18n/tiv"), {
      params: Promise.resolve({ locale: "tiv" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("max-age=300");
    expect(json.ok).toBe(true);
    expect(json.data.locale).toBe("tiv");
  });

  it("returns 404 when locale is unknown or inactive", async () => {
    mockGetDictionaryForLocale.mockRejectedValueOnce(
      new NotFoundError('Unsupported or inactive language: "xyz"'),
    );

    const res = await GET(new Request("http://localhost/api/i18n/xyz"), {
      params: Promise.resolve({ locale: "xyz" }),
    });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });
});

