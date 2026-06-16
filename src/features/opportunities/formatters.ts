export function formatOpportunityDate(value?: string) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatStipend(value?: number) {
  if (value === undefined) {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatStatus(value?: string) {
  if (!value) {
    return "Submitted";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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
