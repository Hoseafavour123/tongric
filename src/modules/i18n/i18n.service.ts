import "server-only";
import { getDb } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  getBundledFallbackDictionary,
  getBundledFallbackLanguages,
  InMemoryTranslationCache,
  normalizeLocaleCode,
  resolveDictionaryForLocale,
  type LocaleDictionaryPayload,
  type PublicLanguageSummary,
} from "./i18n-core";
import { createPrismaI18nRepository } from "./i18n-prisma-repo";
import { createTranslator, type TranslatorFn } from "./translator";

const translationCache = new InMemoryTranslationCache();

export function invalidateTranslationCache(locale?: string): void {
  translationCache.invalidate(locale ? normalizeLocaleCode(locale) : undefined);
}

export async function getActiveLanguages(): Promise<PublicLanguageSummary[]> {
  try {
    const repo = createPrismaI18nRepository(getDb());
    const rows = await repo.listActiveLanguages();
    return rows.length > 0 ? rows : getBundledFallbackLanguages();
  } catch {
    return getBundledFallbackLanguages();
  }
}

/**
 * Loads validated translations for an active locale.
 * Throws NotFoundError (404) if the locale code does not match an active language.
 */
export async function getDictionaryForLocale(
  locale: string,
): Promise<LocaleDictionaryPayload> {
  const repo = createPrismaI18nRepository(getDb());
  const payload = await resolveDictionaryForLocale(
    repo,
    translationCache,
    locale,
  );

  if (!payload) {
    throw new NotFoundError(`Unsupported or inactive language: "${locale}"`);
  }

  return payload;
}

/**
 * Loads dictionary payload safely for SSR layouts, degrading cleanly to
 * bundled English defaults if the database or cookie locale is unavailable.
 */
export async function getSafeDictionaryForSsr(
  locale: string,
): Promise<LocaleDictionaryPayload> {
  try {
    return await getDictionaryForLocale(locale);
  } catch {
    return getBundledFallbackDictionary(locale);
  }
}

export async function getServerTranslator(locale: string): Promise<{
  locale: string;
  languages: PublicLanguageSummary[];
  t: TranslatorFn;
}> {
  const payload = await getDictionaryForLocale(locale);
  return {
    locale: payload.locale,
    languages: payload.languages,
    t: createTranslator(payload.messages),
  };
}
