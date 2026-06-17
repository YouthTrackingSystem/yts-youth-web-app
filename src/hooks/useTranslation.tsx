"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  defaultLanguage,
  languages,
  type LanguageCode,
  translations,
  type TranslationKey
} from "@/lib/i18n/translations";

const storageKey = "yts-language";

type TranslationContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

function isLanguageCode(value: string | null): value is LanguageCode {
  return languages.some((language) => language.code === value);
}

function interpolate(value: string, params?: Record<string, string | number>) {
  if (!params) return value;

  return Object.entries(params).reduce(
    (label, [key, replacement]) => label.replaceAll(`{${key}}`, String(replacement)),
    value
  );
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(storageKey);
    if (isLanguageCode(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  function setLanguage(nextLanguage: LanguageCode) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(storageKey, nextLanguage);
    document.documentElement.lang = nextLanguage;
  }

  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) => interpolate(translations[language][key] ?? translations.en[key], params)
    }),
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }

  return context;
}
