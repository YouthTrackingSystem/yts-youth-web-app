import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/auth/token";
import { env } from "@/lib/env";
import type {
  YouthApplicationCreateDraftInput,
  YouthApplicationDraftInput,
  YouthApplicationSummary
} from "@/types/youth";

export type ApplicationsService = {
  list: () => Promise<YouthApplicationSummary[]>;
  getById: (id: string) => Promise<YouthApplicationSummary>;
  createDraft: (payload: YouthApplicationCreateDraftInput) => Promise<YouthApplicationSummary>;
  updateDraft: (
    id: string,
    payload: YouthApplicationDraftInput
  ) => Promise<YouthApplicationSummary>;
  submitDraft: (id: string) => Promise<YouthApplicationSummary>;
  uploadCv: (id: string, payload: FormData) => Promise<YouthApplicationSummary>;
  downloadCv: (id: string) => Promise<Blob>;
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

function readBoolean(record: ApiRecord, key: string) {
  const value = record[key];

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["1", "true", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
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
    hasCv: readBoolean(application, "has_cv") || readBoolean(application, "hasCv"),
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

function createDraftPayload(payload: YouthApplicationCreateDraftInput) {
  return {
    opportunity_id: payload.opportunityId,
    cover_note: payload.coverNote,
    portfolio_url: payload.portfolioUrl || null,
    notes: payload.notes || null,
    save_as: "draft"
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

  async createDraft(payload) {
    const response = await apiClient.request<unknown>(
      apiEndpoints.youth.applications,
      { method: "POST", body: createDraftPayload(payload) }
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

  async uploadCv(id, payload) {
    await apiClient.request<unknown>(apiEndpoints.youth.applicationCv(id), {
      method: "POST",
      body: payload
    });

    return this.getById(id);
  },

  async downloadCv(id) {
    if (!env.NEXT_PUBLIC_API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
    }

    const headers = new Headers({ Accept: "*/*" });
    const token = getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/${apiEndpoints.youth
        .applicationCv(id)
        .replace(/^\//, "")}`,
      { headers }
    );

    if (!response.ok) {
      throw new ApiError(
        `Unable to download CV. API request failed with status ${response.status}.`,
        response.status
      );
    }

    return response.blob();
  }
};
