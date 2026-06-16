export function formatApplicationDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function applicationStatusBadgeClass(statusCode: string) {
  switch (statusCode.toLowerCase()) {
    case "draft":
      return "bg-amber-50 text-amber-800";
    case "submitted":
      return "bg-blue-50 text-blue-800";
    case "applied":
      return "bg-brand-50 text-brand-700";
    case "approved":
    case "shortlisted":
      return "bg-green-50 text-green-800";
    case "rejected":
      return "bg-red-50 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
