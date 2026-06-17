"use client";

import { languages, type LanguageCode } from "@/lib/i18n/translations";
import { useTranslation } from "@/hooks/useTranslation";

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
      <span className="sr-only">{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        value={language}
      >
        {languages.map((option) => (
          <option key={option.code} value={option.code}>
            {option.code === "en" ? t("language.english") : t("language.swahili")}
          </option>
        ))}
      </select>
    </label>
  );
}
