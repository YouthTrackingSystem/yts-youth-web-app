import type { LanguageCode } from "@/lib/i18n/translations";

export function formatOpportunityDate(value: string | undefined, language: LanguageCode, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "sw" ? "sw-TZ" : "en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatStipend(value: number | undefined, language: LanguageCode, fallback: string) {
  if (value === undefined) {
    return fallback;
  }

  return new Intl.NumberFormat(language === "sw" ? "sw-TZ" : "en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0
  }).format(value);
}

export function opportunityStatusBadgeClass(statusCode: string) {
  switch (statusCode.toLowerCase()) {
    case "published":
      return "bg-green-50 text-green-800";
    case "closed":
    case "expired":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-amber-50 text-amber-800";
  }
}
