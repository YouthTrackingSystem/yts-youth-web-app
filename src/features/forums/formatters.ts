import type { LanguageCode } from "@/lib/i18n/translations";

export function formatForumDate(value: string | undefined, language: LanguageCode) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language === "sw" ? "sw-TZ" : "en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function forumStatusBadgeClass(status: string) {
  switch (status.trim().toLowerCase()) {
    case "active":
      return "bg-green-50 text-green-800";
    case "inactive":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-amber-50 text-amber-800";
  }
}
