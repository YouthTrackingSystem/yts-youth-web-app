import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiEndpointPendingError } from "@/lib/api/errors";
import type {
  YouthApplicationDraftInput,
  YouthApplicationSummary
} from "@/types/youth";

export type ApplicationsService = {
  list: () => Promise<YouthApplicationSummary[]>;
  getById: (id: string) => Promise<YouthApplicationSummary>;
  create: (payload: unknown) => Promise<YouthApplicationSummary>;
  updateDraft: (
    id: string,
    payload: YouthApplicationDraftInput
  ) => Promise<YouthApplicationSummary>;
  submitDraft: (id: string) => Promise<YouthApplicationSummary>;
  uploadCv: (id: string, payload: FormData) => Promise<YouthApplicationSummary>;
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

function normalizeApplication(value: unknown): YouthApplicationSummary {
  const application = asRecord(value);
  const opportunity = asRecord(application.opportunity);
  const stakeholder = asRecord(opportunity.stakeholder);
  const status = asRecord(application.status);
  const statusCode = readString(status, "code") ?? "unknown";

  return {
    id: readString(application, "id") ?? "",
    opportunityId: readString(application, "opportunity_id") ?? "",
    opportunityTitle: readString(opportunity, "title") ?? "Untitled opportunity",
    stakeholderName: readString(stakeholder, "name") ?? "Not specified",
    statusCode,
    statusLabel: readString(status, "label") ?? statusCode,
    coverNote: readString(application, "cover_note"),
    portfolioUrl: readString(application, "portfolio_url"),
    notes: readString(application, "notes"),
    appliedAt: readString(application, "applied_at"),
    decisionAt: readString(application, "decision_at"),
    isDraft: statusCode.toLowerCase() === "draft"
  };
}

function unwrapApplication(response: unknown) {
  const payload = asRecord(response);
  return normalizeApplication(payload.application ?? payload.data ?? response);
}

function draftPayload(payload: YouthApplicationDraftInput) {
  return {
    cover_note: payload.coverNote,
    portfolio_url: payload.portfolioUrl || null,
    notes: payload.notes || null
  };
}

export const applicationsService: ApplicationsService = {
  async list() {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.applications,
      { cache: "no-store" }
    );
    const payload = asRecord(response);
    const applications = Array.isArray(payload.data) ? payload.data : [];

    return applications.map(normalizeApplication).filter(({ id }) => id);
  },

  async getById(id) {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.application(id),
      { cache: "no-store" }
    );

    return unwrapApplication(response);
  },

  async create(payload) {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.applications,
      { method: "POST", body: payload }
    );

    return unwrapApplication(response);
  },

  async updateDraft(id, payload) {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.application(id),
      { method: "PATCH", body: draftPayload(payload) }
    );

    return unwrapApplication(response);
  },

  async submitDraft(id) {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.applicationSubmit(id),
      { method: "POST" }
    );

    return unwrapApplication(response);
  },

  async uploadCv(id, _payload) {
    // TODO(Phase 2B backend): POST multipart form data to
    // apiEndpoints.youth.applicationCv(id), scoped to the current youth.
    throw new ApiEndpointPendingError(apiEndpoints.youth.applicationCv(id));
  }
};
