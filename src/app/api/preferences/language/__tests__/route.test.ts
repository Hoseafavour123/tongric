import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/lib/errors";
import { getDefaultDictionary } from "@/modules/i18n/base-dictionary";

const mockGetDictionaryForLocale = vi.fn();

vi.mock("@/modules/i18n/i18n.service", () => ({
  getDictionaryForLocale: (locale: string) => mockGetDictionaryForLocale(locale),
}));

import { POST } from "../route";

describe("POST /api/preferences/language", () => {
  it("persists an active locale cookie and returns updated dictionary payload", async () => {
    mockGetDictionaryForLocale.mockResolvedValueOnce({
      locale: "ido",
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
          code: "ido",
          name: "Idoma",
          nativeName: "Idoma",
          isDefault: false,
          isPilotPriority: true,
          validatedCount: 0,
          totalKeyCount: 60,
        },
      ],
      messages: getDefaultDictionary(),
    });

    const req = new Request("http://localhost/api/preferences/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: "ido" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.locale).toBe("ido");
    expect(res.headers.get("set-cookie")).toContain("tongric_locale=ido");
  });

  it("returns 400 on malformed JSON or invalid locale format", async () => {
    const req = new Request("http://localhost/api/preferences/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: "x" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 when locale is inactive or unsupported", async () => {
    mockGetDictionaryForLocale.mockRejectedValueOnce(
      new NotFoundError('Unsupported or inactive language: "fr"'),
    );

    const req = new Request("http://localhost/api/preferences/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: "fr" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });
});

