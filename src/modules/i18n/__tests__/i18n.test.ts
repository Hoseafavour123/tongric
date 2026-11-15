import { describe, expect, it, vi } from "vitest";
import {
  BASE_TRANSLATIONS,
  getDefaultDictionary,
  SUPPORTED_PILOT_LANGUAGES,
} from "../base-dictionary";
import {
  InMemoryTranslationCache,
  mergeValidatedEntries,
  resolveDictionaryForLocale,
  syncTranslationsWithRepo,
  type I18nRepository,
} from "../i18n-core";
import { resolveLocaleFromCookie } from "../locale-cookie";
import { createTranslator, interpolateParams } from "../translator";

describe("i18n translator & validation gate", () => {
  it("configures English, Tiv, Idoma, and Hausa as pilot languages", () => {
    expect(SUPPORTED_PILOT_LANGUAGES.map((l) => l.code)).toEqual([
      "en",
      "tiv",
      "ido",
      "ha",
    ]);
  });

  it("merges strictly VALIDATED non-empty entries and falls back to English for DRAFT/REVIEWED", () => {
    const merged = mergeValidatedEntries([
      { key: "nav.home", text: "Ya", status: "VALIDATED" },
      { key: "nav.market", text: "Kasuwa draft", status: "DRAFT" },
      { key: "nav.orders", text: "Reviewed only", status: "REVIEWED" },
      { key: "common.save", text: "   ", status: "VALIDATED" },
    ]);

    expect(merged["nav.home"]).toBe("Ya");
    expect(merged["nav.market"]).toBe(BASE_TRANSLATIONS["nav.market"].defaultText);
    expect(merged["nav.orders"]).toBe(BASE_TRANSLATIONS["nav.orders"].defaultText);
    expect(merged["common.save"]).toBe(BASE_TRANSLATIONS["common.save"].defaultText);
  });

  it("interpolates parameters safely without evaluating markup", () => {
    expect(
      interpolateParams("Reserved {{qty}}kg of {{crop}}", {
        qty: 500,
        crop: "tomatoes",
      }),
    ).toBe("Reserved 500kg of tomatoes");

    expect(interpolateParams("Hello {{missing}}")).toBe("Hello {{missing}}");

    const t = createTranslator({ "nav.home": "Gida" });
    expect(t("nav.home")).toBe("Gida");
    expect(t("nav.market")).toBe("Market");
  });
});

describe("resolveDictionaryForLocale & caching", () => {
  function createMockRepo(overrides: Partial<I18nRepository> = {}): I18nRepository {
    return {
      listActiveLanguages: vi.fn().mockResolvedValue(
        SUPPORTED_PILOT_LANGUAGES.map((l) => ({
          code: l.code,
          name: l.name,
          nativeName: l.nativeName,
          isDefault: l.isDefault,
          isPilotPriority: l.isPilotPriority,
          validatedCount: l.code === "en" ? Object.keys(BASE_TRANSLATIONS).length : 0,
          totalKeyCount: Object.keys(BASE_TRANSLATIONS).length,
        })),
      ),
      listValidatedEntriesForLocale: vi
        .fn()
        .mockResolvedValue([{ key: "nav.home", text: "Gida", status: "VALIDATED" }]),
      upsertLanguage: vi.fn().mockResolvedValue(undefined),
      upsertTranslationKey: vi.fn().mockResolvedValue({ id: "key_1" }),
      ensureTranslationEntry: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  it("caches resolved dictionaries and clears cleanly on invalidation", async () => {
    const repo = createMockRepo();
    const cache = new InMemoryTranslationCache(60_000);

    const first = await resolveDictionaryForLocale(repo, cache, "HA");
    const second = await resolveDictionaryForLocale(repo, cache, "ha");

    expect(first?.locale).toBe("ha");
    expect(first?.messages["nav.home"]).toBe("Gida");
    expect(second?.messages["nav.home"]).toBe("Gida");
    expect(repo.listValidatedEntriesForLocale).toHaveBeenCalledTimes(1);

    cache.invalidate("ha");
    await resolveDictionaryForLocale(repo, cache, "ha");
    expect(repo.listValidatedEntriesForLocale).toHaveBeenCalledTimes(2);
  });

  it("returns null for unknown locales and falls back to English if DB errors for a known pilot code", async () => {
    const repo = createMockRepo();
    const cache = new InMemoryTranslationCache();

    expect(await resolveDictionaryForLocale(repo, cache, "fr")).toBeNull();

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const brokenRepo = createMockRepo({
      listActiveLanguages: vi.fn().mockRejectedValue(new Error("DB offline")),
    });

    const fallback = await resolveDictionaryForLocale(brokenRepo, cache, "tiv");
    expect(fallback?.locale).toBe("tiv");
    expect(fallback?.messages).toEqual(getDefaultDictionary());
    expect(await resolveDictionaryForLocale(brokenRepo, cache, "xx")).toBeNull();
    warnSpy.mockRestore();
  });

  it("syncs all 4 pilot languages and all base keys idempotently", async () => {
    const repo = createMockRepo();
    const summary = await syncTranslationsWithRepo(repo);

    expect(summary.languagesSynced).toBe(4);
    expect(summary.keysSynced).toBe(Object.keys(BASE_TRANSLATIONS).length);
    expect(repo.upsertLanguage).toHaveBeenCalledTimes(4);
    expect(repo.ensureTranslationEntry).toHaveBeenCalledTimes(
      Object.keys(BASE_TRANSLATIONS).length * 4,
    );
  });

  it("resolves locale cookies safely and rejects tampered values", () => {
    expect(resolveLocaleFromCookie("tiv")).toEqual({
      locale: "tiv",
      hasExplicitLocale: true,
    });
    expect(resolveLocaleFromCookie("IDO")).toEqual({
      locale: "ido",
      hasExplicitLocale: true,
    });
    expect(resolveLocaleFromCookie(undefined)).toEqual({
      locale: "en",
      hasExplicitLocale: false,
    });
    expect(resolveLocaleFromCookie("../evil")).toEqual({
      locale: "en",
      hasExplicitLocale: false,
    });
  });
});

