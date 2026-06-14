import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiEndpointPendingError } from "@/lib/api/errors";
import type {
  YouthProfileAddressInput,
  YouthProfilePersonalInput,
  YouthProfileSummary
} from "@/types/youth";

export type ProfileService = {
  getProfile: () => Promise<YouthProfileSummary | null>;
  updatePersonal: (payload: YouthProfilePersonalInput) => Promise<YouthProfileSummary | null>;
  updateAddress: (payload: YouthProfileAddressInput) => Promise<YouthProfileSummary | null>;
  uploadAvatar: (payload: FormData) => Promise<YouthProfileSummary>;
};

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value !== null && typeof value === "object" ? (value as ApiRecord) : {};
}

function readString(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

function readNumber(record: ApiRecord, key: string) {
  const value = record[key];
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeList(value: unknown, keys: string[]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      const record = asRecord(item);

      for (const key of keys) {
        const direct = readString(record, key);
        if (direct) return direct;

        const nested = asRecord(record[key]);
        const nestedLabel = readString(nested, "name", "label", "title");
        if (nestedLabel) return nestedLabel;
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeOccupation(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const occupation = asRecord(item);
      const position = readString(occupation, "position");
      const employer = readString(occupation, "employer");
      const sector = asRecord(occupation.occupation_sector);
      const sectorName = readString(sector, "name", "label");

      return [position, employer, sectorName].filter(Boolean).join(" at ") || undefined;
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeEducation(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const education = asRecord(item);
      const level =
        readString(education, "education_level", "level", "qualification") ??
        readString(asRecord(education.education_level), "name", "label");
      const institution = readString(education, "institution", "school_name");

      return [level, institution].filter(Boolean).join(" - ") || undefined;
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeProfile(response: unknown): YouthProfileSummary | null {
  const payload = asRecord(response);
  const profile = asRecord(payload.profile);
  const user = asRecord(payload.user);

  if (!readString(profile, "id")) {
    return null;
  }

  const addresses = Array.isArray(payload.addresses) ? payload.addresses : [];
  const residenceRecord = addresses
    .map(asRecord)
    .find((address) => readString(address, "address_type")?.toLowerCase() === "residence");
  const locationParts = residenceRecord
    ? ["street", "ward", "district", "region", "country"]
        .map((key) => readString(asRecord(residenceRecord[key]), "name"))
        .filter((part): part is string => Boolean(part))
    : [];

  return {
    id: readString(profile, "id") ?? "",
    name: readString(profile, "name") ?? readString(user, "name") ?? "Youth",
    email: readString(profile, "email") ?? readString(user, "email"),
    phoneNumber: readString(profile, "primary_phone") ?? readString(user, "phone_number"),
    birthDate: readString(profile, "birth_date"),
    gender: readString(profile, "gender") ?? readString(user, "gender"),
    maritalStatus: readString(profile, "marital_status"),
    emergencyContact: readString(profile, "emergency_contact"),
    hasDisability: readString(profile, "has_disability"),
    journeyStatus:
      readString(profile, "status", "journey_status", "youth_status") ??
      readString(payload, "status", "journey_status", "youth_status"),
    registrationStatus: readString(profile, "registration_status") ?? "UNKNOWN",
    profileCompletion: readNumber(profile, "completion_percentage"),
    residence: residenceRecord
      ? {
          physicalAddress: readString(residenceRecord, "physical_address"),
          latitude: readString(residenceRecord, "latitude"),
          longitude: readString(residenceRecord, "longitude"),
          location: locationParts.join(", ") || "Location not specified"
        }
      : null,
    occupations: normalizeOccupation(payload.occupations),
    educations: normalizeEducation(payload.educations),
    skills: normalizeList(payload.skills, ["skill", "name", "label"]),
    languages: normalizeList(payload.languages, ["language", "name", "label"]),
    pathways: normalizeList(payload.pathways, ["pathway", "name", "title", "label"]),
    wishes: normalizeList(payload.wishes, ["wish", "name", "title", "label", "description"]),
    documents: normalizeList(payload.documents, ["document_type", "type", "name", "title"])
  };
}

export const profileService: ProfileService = {
  async getProfile() {
    const response = await apiClient.request<unknown>(apiEndpoints.youth.profile, {
      cache: "no-store"
    });

    return normalizeProfile(response);
  },

  async updatePersonal(payload) {
    await apiClient.request<void>(apiEndpoints.youth.profilePersonal, {
      method: "PATCH",
      body: {
        email: payload.email || null,
        marital_status: payload.maritalStatus,
        emergency_contact: payload.emergencyContact,
        has_disability: payload.hasDisability
      }
    });

    return this.getProfile();
  },

  async updateAddress(payload) {
    await apiClient.request<void>(apiEndpoints.youth.profileAddress, {
      method: "PATCH",
      body: {
        physical_address: payload.physicalAddress,
        latitude: payload.latitude || null,
        longitude: payload.longitude || null
      }
    });

    return this.getProfile();
  },

  async uploadAvatar(_payload) {
    // TODO(Phase 2B backend): POST multipart form data to
    // apiEndpoints.youth.profileAvatar.
    throw new ApiEndpointPendingError(apiEndpoints.youth.profileAvatar);
  }
};
