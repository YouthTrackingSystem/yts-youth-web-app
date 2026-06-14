import { apiEndpoints } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/token";
import type { LoginCredentials, LoginResult, YouthSessionState } from "@/types/auth";
import { emptyYouthCapabilities } from "@/types/permissions";
import type { YouthCapabilities } from "@/types/permissions";

export type AuthService = {
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  getSession: () => Promise<YouthSessionState>;
};

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value !== null && typeof value === "object" ? (value as ApiRecord) : {};
}

function unwrapData(value: unknown) {
  const record = asRecord(value);
  return record.data ?? value;
}

function readString(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

function normalizeCapabilities(value: unknown): YouthCapabilities {
  const capabilities = asRecord(value);

  return {
    auth: {
      canLogin: Boolean(asRecord(capabilities.auth).canLogin ?? asRecord(capabilities.auth).can_login),
      canLogout: Boolean(asRecord(capabilities.auth).canLogout ?? asRecord(capabilities.auth).can_logout)
    },
    dashboard: {
      canView: Boolean(asRecord(capabilities.dashboard).canView ?? asRecord(capabilities.dashboard).can_view)
    },
    profile: {
      canView: Boolean(asRecord(capabilities.profile).canView ?? asRecord(capabilities.profile).can_view),
      canUpdate: Boolean(asRecord(capabilities.profile).canUpdate ?? asRecord(capabilities.profile).can_update),
      canUploadAvatar: Boolean(
        asRecord(capabilities.profile).canUploadAvatar ??
          asRecord(capabilities.profile).can_upload_avatar
      ),
      editableFields: Array.isArray(asRecord(capabilities.profile).editableFields)
        ? (asRecord(capabilities.profile).editableFields as string[])
        : Array.isArray(asRecord(capabilities.profile).editable_fields)
          ? (asRecord(capabilities.profile).editable_fields as string[])
          : []
    },
    opportunities: {
      canView: Boolean(
        asRecord(capabilities.opportunities).canView ??
          asRecord(capabilities.opportunities).can_view
      ),
      canApply: Boolean(
        asRecord(capabilities.opportunities).canApply ??
          asRecord(capabilities.opportunities).can_apply
      )
    },
    applications: {
      canView: Boolean(asRecord(capabilities.applications).canView ?? asRecord(capabilities.applications).can_view),
      canCreate: Boolean(
        asRecord(capabilities.applications).canCreate ??
          asRecord(capabilities.applications).can_create
      ),
      canUpdateDraft: Boolean(
        asRecord(capabilities.applications).canUpdateDraft ??
          asRecord(capabilities.applications).can_update_draft
      ),
      canSubmit: Boolean(
        asRecord(capabilities.applications).canSubmit ??
          asRecord(capabilities.applications).can_submit
      ),
      canManageCv: Boolean(
        asRecord(capabilities.applications).canManageCv ??
          asRecord(capabilities.applications).can_manage_cv
      )
    }
  };
}

function normalizeSession(response: unknown): YouthSessionState {
  const payload = asRecord(unwrapData(response));
  const user = asRecord(payload.user);
  const sessionStatus = (
    readString(payload, "status", "session_status") ?? "registration_incomplete"
  ).trim().toLowerCase();
  const registrationStatus = (
    readString(payload, "registration_status", "registrationStatus") ?? "UNKNOWN"
  ).trim().toUpperCase();
  const normalizedStatus = ["DRAFT", "SUBMITTED", "REJECTED", "APPROVED"].includes(
    registrationStatus
  )
    ? registrationStatus
    : "UNKNOWN";
  const capabilities = payload.capabilities
    ? normalizeCapabilities(payload.capabilities)
    : emptyYouthCapabilities;
  const sessionUser = {
    id: readString(user, "id") ?? "",
    youthProfileId: readString(user, "youth_profile_id", "youthProfileId"),
    name: readString(user, "name", "full_name", "fullName") ?? "Youth",
    email: readString(user, "email"),
    phoneNumber: readString(user, "phone_number", "phoneNumber"),
    roles: Array.isArray(user.roles) ? (user.roles as string[]) : ["Youth"]
  };

  if (sessionStatus === "unauthenticated") {
    return {
      status: "unauthenticated",
      isAuthenticated: false,
      user: null,
      capabilities: null,
      registrationStatus: "UNKNOWN"
    };
  }

  if (sessionStatus === "authenticated" && normalizedStatus === "APPROVED") {
    return {
      status: "authenticated",
      isAuthenticated: true,
      user: sessionUser,
      capabilities,
      registrationStatus: "APPROVED"
    };
  }

  return {
    status: "blocked",
    isAuthenticated: true,
    user: sessionUser,
    capabilities,
    registrationStatus: normalizedStatus as "DRAFT" | "SUBMITTED" | "REJECTED" | "UNKNOWN",
    rejectedReason: readString(payload, "rejected_reason", "rejectedReason"),
    reason:
      sessionStatus === "not_whitelisted"
        ? "not_whitelisted"
        : sessionStatus === "awaiting_approval"
          ? "awaiting_approval"
          : sessionStatus === "registration_rejected"
            ? "registration_rejected"
            : "registration_incomplete"
  };
}

function extractToken(response: unknown) {
  const payload = asRecord(unwrapData(response));
  return readString(payload, "token", "access_token", "accessToken");
}

export const authService: AuthService = {
  async login(credentials) {
    const response = await apiClient.request<unknown>(apiEndpoints.auth.login, {
      method: "POST",
      body: {
        phone_number: credentials.phoneNumber,
        password: credentials.password
      },
      skipAuth: true
    });
    const token = extractToken(response);

    if (!token) {
      throw new Error("The login response did not include an access token.");
    }

    setAccessToken(token);

    try {
      const session = await this.getSession();
      return { session };
    } catch (error) {
      clearAccessToken();
      throw error;
    }
  },

  async logout() {
    try {
      await apiClient.request<void>(apiEndpoints.auth.logout, { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },

  async getSession() {
    if (!getAccessToken()) {
      return {
        status: "unauthenticated",
        isAuthenticated: false,
        user: null,
        capabilities: null,
        registrationStatus: "UNKNOWN"
      };
    }

    const response = await apiClient.request<unknown>(apiEndpoints.auth.session, {
      cache: "no-store"
    });
    return normalizeSession(response);
  }
};
