import type { Translate, TranslationKey } from "./translations";

const opportunityTypeKeys: Record<string, TranslationKey> = {
  job: "opportunityType.job",
  training: "opportunityType.training",
  volunteer: "opportunityType.volunteer",
  volunteering: "opportunityType.volunteering",
  business: "opportunityType.business",
  internship: "opportunityType.internship",
  scholarship: "opportunityType.scholarship",
  grant: "opportunityType.grant",
  tender: "opportunityType.tender"
};

function normalizeOpportunityType(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function translateOpportunityType(value: string, t: Translate) {
  const key = opportunityTypeKeys[normalizeOpportunityType(value)];
  return key ? t(key) : value;
}
