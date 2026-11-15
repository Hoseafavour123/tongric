import {
  BASE_TRANSLATIONS,
  DEFAULT_LOCALE,
  getDefaultDictionary,
  SUPPORTED_PILOT_LANGUAGES,
  type PilotLanguageDefinition,
  type TranslationDictionary,
} from "./base-dictionary.ts";

export type TranslationReviewStatus = "DRAFT" | "REVIEWED" | "VALIDATED";

export interface PublicLanguageSummary {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
  isPilotPriority: boolean;
  validatedCount: number;
  totalKeyCount: number;
}

export interface TranslationEntryRecord {
  key: string;
  text: string;
  status: TranslationReviewStatus;
}

export interface LocaleDictionaryPayload {
  locale: string;
  fallbackLocale: string;
  languages: PublicLanguageSummary[];
  messages: TranslationDictionary;
}

export interface I18nRepository {
  listActiveLanguages(): Promise<PublicLanguageSummary[]>;
  listValidatedEntriesForLocale(
    locale: string,
  ): Promise<TranslationEntryRecord[]>;
  upsertLanguage(lang: PilotLanguageDefinition): Promise<void>;
  upsertTranslationKey(input: {
    namespace: string;
    key: string;
    description: string;
    defaultText: string;
  }): Promise<{ id: string }>;
  ensureTranslationEntry(input: {
    translationKeyId: string;
    languageCode: string;
    defaultText: string;
    isDefaultLocale: boolean;
  }): Promise<void>;
}

/**
 * Merges strictly VALIDATED non-empty entries over the authoritative English dictionary.
 * DRAFT, REVIEWED, or blank translations always fall back to English.
 */
export function mergeValidatedEntries(
  entries: readonly TranslationEntryRecord[],
): TranslationDictionary {
  const merged: Record<string, string> = { ...getDefaultDictionary() };

  for (const entry of entries) {
    if (entry.status !== "VALIDATED") {
      continue;
    }
    const cleanText = entry.text.trim();
    if (cleanText.length === 0) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(merged, entry.key)) {
      merged[entry.key] = cleanText;
    }
  }

  return merged as TranslationDictionary;
}

export class InMemoryTranslationCache {
  private readonly store = new Map<
    string,
    { expiresAt: number; payload: LocaleDictionaryPayload }
  >();
  private readonly ttlMs: number;

  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(locale: string, now = Date.now()): LocaleDictionaryPayload | null {
    const hit = this.store.get(locale);
    if (!hit) {
      return null;
    }
    if (now >= hit.expiresAt) {
      this.store.delete(locale);
      return null;
    }
    return hit.payload;
  }

  set(
    locale: string,
    payload: LocaleDictionaryPayload,
    now = Date.now(),
  ): void {
    this.store.set(locale, {
      payload,
      expiresAt: now + this.ttlMs,
    });
  }

  invalidate(locale?: string): void {
    if (locale) {
      this.store.delete(locale);
      return;
    }
    this.store.clear();
  }
}

export function normalizeLocaleCode(rawLocale: string): string {
  return rawLocale.trim().toLowerCase();
}

export function getBundledFallbackLanguages(): PublicLanguageSummary[] {
  const totalKeyCount = Object.keys(BASE_TRANSLATIONS).length;
  return SUPPORTED_PILOT_LANGUAGES.map((lang) => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName,
    isDefault: lang.isDefault,
    isPilotPriority: lang.isPilotPriority,
    validatedCount: lang.code === DEFAULT_LOCALE ? totalKeyCount : 0,
    totalKeyCount,
  }));
}

export function getBundledFallbackDictionary(
  locale: string = DEFAULT_LOCALE,
): LocaleDictionaryPayload {
  const languages = getBundledFallbackLanguages();
  const safeLocale = languages.some((lang) => lang.code === locale)
    ? locale
    : DEFAULT_LOCALE;
  return {
    locale: safeLocale,
    fallbackLocale: DEFAULT_LOCALE,
    languages,
    messages: getDefaultDictionary(),
  };
}

/**
 * Loads validated translations for an active locale with in-memory caching and
 * graceful fallback to bundled English defaults if the database is temporarily unavailable.
 */
export async function resolveDictionaryForLocale(
  repo: I18nRepository,
  cache: InMemoryTranslationCache,
  rawLocale: string,
): Promise<LocaleDictionaryPayload | null> {
  const locale = normalizeLocaleCode(rawLocale);
  if (!locale) {
    return null;
  }

  const cached = cache.get(locale);
  if (cached) {
    return cached;
  }

  let languages: PublicLanguageSummary[];
  try {
    languages = await repo.listActiveLanguages();
  } catch (error) {
    console.warn(
      "[Tongric i18n] Failed to load languages from DB; checking bundled pilot list.",
      error,
    );
    const bundled = getBundledFallbackLanguages();
    if (!bundled.some((lang) => lang.code === locale)) {
      return null;
    }
    return {
      locale,
      fallbackLocale: DEFAULT_LOCALE,
      languages: bundled,
      messages: getDefaultDictionary(),
    };
  }

  const active = languages.find((lang) => lang.code === locale);
  if (!active) {
    return null;
  }

  let entries: TranslationEntryRecord[] = [];
  if (locale !== DEFAULT_LOCALE) {
    try {
      entries = await repo.listValidatedEntriesForLocale(locale);
    } catch (error) {
      console.warn(
        `[Tongric i18n] Failed to load validated entries for "${locale}"; falling back to English.`,
        error,
      );
      entries = [];
    }
  }

  const payload: LocaleDictionaryPayload = {
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    languages,
    messages: mergeValidatedEntries(entries),
  };

  cache.set(locale, payload);
  return payload;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise((res) => setTimeout(res, attempt * 500));
    }
  }
}

/**
 * Idempotently syncs supported pilot languages, English base keys, and empty
 * DRAFT entry placeholders for non-default languages without overwriting human edits.
 */
export async function syncTranslationsWithRepo(
  repo: I18nRepository,
): Promise<{ languagesSynced: number; keysSynced: number }> {
  for (const lang of SUPPORTED_PILOT_LANGUAGES) {
    await withRetry(() => repo.upsertLanguage(lang));
  }

  const entries = Object.entries(BASE_TRANSLATIONS);
  const CHUNK_SIZE = 5;
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    if (i % 25 === 0 || i + CHUNK_SIZE >= entries.length) {
      console.log(
        `[Tongric i18n] Syncing keys ${i + 1}–${Math.min(i + CHUNK_SIZE, entries.length)} of ${entries.length}...`,
      );
    }
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async ([key, def]) => {
        const keyRecord = await withRetry(() =>
          repo.upsertTranslationKey({
            namespace: def.namespace,
            key,
            description: def.description,
            defaultText: def.defaultText,
          }),
        );

        for (const lang of SUPPORTED_PILOT_LANGUAGES) {
          await withRetry(() =>
            repo.ensureTranslationEntry({
              translationKeyId: keyRecord.id,
              languageCode: lang.code,
              defaultText: def.defaultText,
              isDefaultLocale: lang.code === DEFAULT_LOCALE,
            }),
          );
        }
      }),
    );
  }

  return {
    languagesSynced: SUPPORTED_PILOT_LANGUAGES.length,
    keysSynced: entries.length,
  };
}
