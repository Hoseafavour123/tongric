import {
  getDefaultDictionary,
  type TranslationKeyId,
} from "./base-dictionary.ts";

export type TranslationParams = Record<string, string | number>;

/**
 * Pure string interpolation replacing {{token}} placeholders safely without HTML evaluation.
 */
export function interpolateParams(
  template: string,
  params?: TranslationParams,
): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (match, token: string) => {
    if (Object.prototype.hasOwnProperty.call(params, token)) {
      return String(params[token]);
    }
    return match;
  });
}

export type TranslatorFn = (
  key: TranslationKeyId,
  params?: TranslationParams,
) => string;

/**
 * Returns a type-safe t(key, params) translator backed by the provided dictionary
 * with guaranteed English defaults for any missing key.
 */
export function createTranslator(
  dictionary: Partial<Record<string, string>> = {},
): TranslatorFn {
  const defaults = getDefaultDictionary();

  return (key, params) => {
    const candidate = dictionary[key];
    const resolved =
      typeof candidate === "string" && candidate.trim().length > 0
        ? candidate
        : (defaults[key] ?? key);
    return interpolateParams(resolved, params);
  };
}
