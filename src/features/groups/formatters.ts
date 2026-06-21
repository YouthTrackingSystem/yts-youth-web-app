import type { LanguageCode } from "@/lib/i18n/translations";

function locale(language: LanguageCode) {
  return language === "sw" ? "sw-TZ" : "en-TZ";
}

export function formatGroupDate(value: string | undefined, language: LanguageCode) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale(language), {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatGroupNumber(value: number | undefined, language: LanguageCode) {
  return new Intl.NumberFormat(locale(language), {
    maximumFractionDigits: 2
  }).format(value ?? 0);
}

export function groupStatusBadgeClass(status: string) {
  switch (status.trim().toLowerCase()) {
    case "active":
      return "bg-green-50 text-green-800";
    case "inactive":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-amber-50 text-amber-800";
  }
}
