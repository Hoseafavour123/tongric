"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resilientFetch } from "@/lib/resilient-fetch";
import { DEFAULT_LOCALE, getDefaultDictionary } from "@/modules/i18n/base-dictionary";
import {
  getBundledFallbackLanguages,
  type LocaleDictionaryPayload,
  type PublicLanguageSummary,
} from "@/modules/i18n/i18n-core";
import { createTranslator, type TranslatorFn } from "@/modules/i18n/translator";

export interface I18nContextValue {
  locale: string;
  languages: PublicLanguageSummary[];
  messages: Record<string, string>;
  hasExplicitLocale: boolean;
  isUpdating: boolean;
  switchError: string | null;
  t: TranslatorFn;
  setLocale: (nextLocale: string) => Promise<boolean>;
  clearSwitchError: () => void;
}

const defaultMessages = getDefaultDictionary();
const defaultLanguages = getBundledFallbackLanguages();

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  languages: defaultLanguages,
  messages: defaultMessages,
  hasExplicitLocale: true,
  isUpdating: false,
  switchError: null,
  t: createTranslator(defaultMessages),
  setLocale: async () => false,
  clearSwitchError: () => {},
});

export interface I18nProviderProps {
  initialLocale?: string;
  initialLanguages?: PublicLanguageSummary[];
  initialMessages?: Record<string, string>;
  initialHasExplicitLocale?: boolean;
  onLocalePersisted?: () => void;
  children: ReactNode;
}

export function I18nProvider({
  initialLocale = DEFAULT_LOCALE,
  initialLanguages = defaultLanguages,
  initialMessages = defaultMessages,
  initialHasExplicitLocale = false,
  onLocalePersisted,
  children,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [languages, setLanguages] = useState(initialLanguages);
  const [messages, setMessages] = useState(initialMessages);
  const [hasExplicitLocale, setHasExplicitLocale] = useState(
    initialHasExplicitLocale,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const t = useMemo(() => createTranslator(messages), [messages]);

  const clearSwitchError = useCallback(() => {
    setSwitchError(null);
  }, []);

  const setLocale = useCallback(
    async (nextLocale: string): Promise<boolean> => {
      setIsUpdating(true);
      setSwitchError(null);

      const result = await resilientFetch<LocaleDictionaryPayload>(
        "/api/preferences/language",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
        },
      );

      setIsUpdating(false);

      if (!result.ok) {
        setSwitchError(t("i18n.switchError"));
        return false;
      }

      setLocaleState(result.data.locale);
      setLanguages(result.data.languages);
      setMessages(result.data.messages);
      setHasExplicitLocale(true);
      if (typeof document !== "undefined") {
        document.documentElement.lang = result.data.locale;
      }
      onLocalePersisted?.();
      return true;
    },
    [onLocalePersisted, t],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      languages,
      messages,
      hasExplicitLocale,
      isUpdating,
      switchError,
      t,
      setLocale,
      clearSwitchError,
    }),
    [
      locale,
      languages,
      messages,
      hasExplicitLocale,
      isUpdating,
      switchError,
      t,
      setLocale,
      clearSwitchError,
    ],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

