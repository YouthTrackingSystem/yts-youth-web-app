import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  OpportunityApplicationState,
  OpportunitySummary
} from "@/types/youth";

export type OpportunitiesService = {
  list: () => Promise<OpportunitySummary[]>;
  getById: (id: string) => Promise<OpportunitySummary>;
  getApplicationState: (id: string) => Promise<OpportunityApplicationState>;
};

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value !== null && typeof value === "object" ? (value as ApiRecord) : {};
}

function readString(record: ApiRecord, key: string) {
  const value = record[key];

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function formatLocation(value: unknown) {
  const location = asRecord(value);
  const parts = ["street", "ward", "district", "region", "country"]
    .map((key) => readString(location, key))
    .filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(", ") : "Location not specified";
}

function normalizeOpportunity(value: unknown): OpportunitySummary {
  const opportunity = asRecord(value);
  const type = asRecord(opportunity.type);
  const stakeholder = asRecord(opportunity.stakeholder);
  const sector = asRecord(opportunity.sector_category);
  const stipend = readString(opportunity, "stipend_amount");
  const stipendAmount = stipend ? Number(stipend) : undefined;

  return {
    id: readString(opportunity, "id") ?? "",
    title: readString(opportunity, "title") ?? "Untitled opportunity",
    description: readString(opportunity, "description"),
    typeLabel: readString(type, "label") ?? "Not specified",
    stakeholderName: readString(stakeholder, "name") ?? "Not specified",
    sectorName: readString(sector, "name") ?? "Not specified",
    location: formatLocation(opportunity.location),
    stipendAmount:
      stipendAmount !== undefined && Number.isFinite(stipendAmount)
        ? stipendAmount
        : undefined,
    opensAt: readString(opportunity, "opens_at"),
    closesAt: readString(opportunity, "closes_at"),
    startsAt: readString(opportunity, "starts_at"),
    endsAt: readString(opportunity, "ends_at")
  };
}

export const opportunitiesService: OpportunitiesService = {
  async list() {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.opportunities,
      { cache: "no-store" }
    );
    const payload = asRecord(response);
    const opportunities = Array.isArray(payload.data) ? payload.data : [];

    return opportunities.map(normalizeOpportunity).filter(({ id }) => id);
  },

  async getById(id) {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.opportunity(id),
      { cache: "no-store" }
    );
    const payload = asRecord(response);

    return normalizeOpportunity(payload.opportunity ?? payload.data ?? response);
  },

  async getApplicationState(id) {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.opportunityApplicationState(id),
      { cache: "no-store" }
    );
    const payload = asRecord(response);

    return {
      hasApplied: Boolean(payload.has_application ?? payload.hasApplied),
      applicationId: readString(payload, "application_id"),
      status: readString(payload, "status")
    };
  }
};
