import type { Translate, TranslationKey } from "./translations";

const statusKeys: Record<string, TranslationKey> = {
  draft: "status.draft",
  submitted: "status.submitted",
  applied: "status.applied",
  under_review: "status.underReview",
  shortlisted: "status.shortlisted",
  selected: "status.selected",
  rejected: "status.rejected",
  withdrawn: "status.withdrawn",
  published: "status.published",
  closed: "status.closed",
  active: "status.active",
  inactive: "status.inactive",
  approved: "status.approved",
  engaged: "status.engaged",
  improved: "status.improved",
  transformed: "status.transformed",
  pending: "status.pending",
  expired: "status.expired",
  open: "status.open",
  completed: "status.completed"
};

function normalizeStatus(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function translateStatus(value: string | undefined, t: Translate, fallback = "-") {
  if (!value) return fallback;

  const key = statusKeys[normalizeStatus(value)];
  return key ? t(key) : value.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
