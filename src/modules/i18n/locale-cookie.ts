import { DEFAULT_LOCALE, SUPPORTED_PILOT_LANGUAGES } from "./base-dictionary.ts";
import { normalizeLocaleCode } from "./i18n-core.ts";

export const LOCALE_COOKIE_NAME = "tongric_locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export function buildLocaleCookieOptions(
  isProduction = process.env.NODE_ENV === "production",
) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
  };
}

const KNOWN_PILOT_CODES = new Set(
  SUPPORTED_PILOT_LANGUAGES.map((lang) => lang.code),
);

/**
 * Resolves a cookie locale safely against valid codes without trusting arbitrary input.
 */
export function resolveLocaleFromCookie(
  rawCookieValue: string | undefined | null,
  allowedCodes: ReadonlySet<string> = KNOWN_PILOT_CODES,
): { locale: string; hasExplicitLocale: boolean } {
  if (!rawCookieValue) {
    return { locale: DEFAULT_LOCALE, hasExplicitLocale: false };
  }

  const normalized = normalizeLocaleCode(rawCookieValue);
  if (!normalized || !allowedCodes.has(normalized)) {
    return { locale: DEFAULT_LOCALE, hasExplicitLocale: false };
  }

  return { locale: normalized, hasExplicitLocale: true };
}

