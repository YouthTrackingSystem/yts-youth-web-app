import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { env } from "@/lib/env";
import type {
  YouthProfileAddressInput,
  YouthProfileOccupationInput,
  YouthProfilePersonalInput,
  YouthProfileWishesInput,
  YouthProfileSummary
} from "@/types/youth";

export type ProfileService = {
  getProfile: () => Promise<YouthProfileSummary | null>;
  updatePersonal: (payload: YouthProfilePersonalInput) => Promise<YouthProfileSummary | null>;
  updateAddress: (payload: YouthProfileAddressInput) => Promise<YouthProfileSummary | null>;
  updateOccupation: (payload: YouthProfileOccupationInput) => Promise<YouthProfileSummary | null>;
  updateWishes: (payload: YouthProfileWishesInput) => Promise<YouthProfileSummary | null>;
  uploadAvatar: (payload: FormData) => Promise<YouthProfileSummary | null>;
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

function readNumberOrNull(record: ApiRecord, key: string) {
  const value = record[key];

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function resolveAvatarUrl(value?: string) {
  if (!value || /^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
  return baseUrl ? new URL(value, `${baseUrl.replace(/\/$/, "")}/`).toString() : value;
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

function normalizeOptions(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const record = asRecord(item);
      const id = readNumberOrNull(record, "id");
      const name = readString(record, "name", "label", "title");

      if (!id || !name) return undefined;

      return {
        id,
        name,
        categoryId: readNumberOrNull(record, "category_id")
      };
    })
    .filter((item): item is { id: number; name: string; categoryId: number | null } =>
      Boolean(item)
    );
}

function normalizeStringOptions(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const options = value
    .map((item) => {
      if (typeof item === "string") return item;

      return readString(asRecord(item), "name", "label", "title", "value", "code");
    })
    .filter((item): item is string => Boolean(item));

  return options.length ? options : fallback;
}

function normalizeOccupationEditor(
  value: unknown,
  sectors: Array<{ id: number; categoryId?: number | null }>
) {
  const record = asRecord(value);
  const sectorId = readNumberOrNull(record, "occupation_sector_id");
  const sectorCategoryId =
    readNumberOrNull(record, "sector_category_id") ??
    sectors.find((sector) => sector.id === sectorId)?.categoryId ??
    null;

  return {
    occupationType: readString(record, "occupation_type", "status", "type") ?? "",
    sectorCategoryId,
    occupationSectorId: sectorId
  };
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

function normalizeWishInput(value: unknown) {
  const wish = asRecord(value);
  const sector = asRecord(wish.sector);

  return {
    id: readNumberOrNull(wish, "id") ?? undefined,
    interestType: readString(wish, "interest_type", "type") ?? "",
    wishSectorId: readNumberOrNull(wish, "wish_sector_id") ?? readNumberOrNull(sector, "id"),
    sectorCategoryId:
      readNumberOrNull(wish, "sector_category_id") ?? readNumberOrNull(sector, "category_id"),
    description: readString(wish, "description", "note", "wish") ?? "",
    isPriority: Boolean(wish.is_priority ?? true)
  };
}

function normalizeWishesEditor(value: unknown) {
  const record = asRecord(value);
  const rawWishes = Array.isArray(record.wishes) ? record.wishes : Array.isArray(value) ? value : [];
  const wishes = rawWishes.map(normalizeWishInput);
  const youthWishes = readString(record, "youth_wishes", "has_wishes") ?? (wishes.length ? "Yes" : "No");

  return {
    youthWishes,
    wishes
  };
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
  const rawOptions = asRecord(payload.options);
  const profileOptions = {
    religions: normalizeOptions(rawOptions.religions),
    sectorCategories: normalizeOptions(rawOptions.sector_categories),
    occupationSectors: normalizeOptions(rawOptions.occupation_sectors),
    interestTypes: normalizeStringOptions(rawOptions.interest_types, [
      "Employed",
      "Self Employed",
      "Business Owner",
      "Any"
    ]),
    occupationTypes: normalizeStringOptions(rawOptions.occupation_types, [
      "Unemployed",
      "Employed",
      "Self Employed",
      "Business Owner"
    ])
  };
  const occupationEditor = normalizeOccupationEditor(
    payload.occupation ?? payload.occupation_editor ?? payload.socio_economic,
    profileOptions.occupationSectors
  );
  const wishesEditor = normalizeWishesEditor(payload.wishes_editor ?? payload.wishes);
  const occupationSectorName = profileOptions.occupationSectors.find(
    (sector) => sector.id === occupationEditor.occupationSectorId
  )?.name;
  const occupationList = normalizeOccupation(payload.occupations);
  const wishesList = normalizeList(payload.wishes, ["wish", "name", "title", "label", "description"]);

  return {
    id: readString(profile, "id") ?? "",
    name: readString(profile, "name") ?? readString(user, "name") ?? "Youth",
    firstName: readString(user, "first_name") ?? "",
    middleName: readString(user, "middle_name"),
    surname: readString(user, "surname") ?? "",
    avatarUrl: resolveAvatarUrl(readString(profile, "avatar_url")),
    email: readString(profile, "email") ?? readString(user, "email"),
    phoneNumber: readString(profile, "primary_phone") ?? readString(user, "phone_number"),
    birthDate: readString(profile, "birth_date"),
    gender: readString(profile, "gender") ?? readString(user, "gender"),
    religionId: readNumberOrNull(profile, "religion_id"),
    maritalStatus: readString(profile, "marital_status"),
    emergencyContact: readString(profile, "emergency_contact"),
    hasDisability: readString(profile, "has_disability"),
    disabilityTypeId:
      readNumberOrNull(profile, "disability_type_id") ??
      readNumberOrNull(asRecord(payload.disability), "disability_type_id") ??
      readNumberOrNull(asRecord(payload.disability), "type_id"),
    journeyStatus:
      readString(profile, "status", "journey_status", "youth_status") ??
      readString(payload, "status", "journey_status", "youth_status"),
    registrationStatus: readString(profile, "registration_status") ?? "UNKNOWN",
    profileCompletion: readNumber(profile, "completion_percentage"),
    residence: residenceRecord
      ? {
          countryId: readNumberOrNull(residenceRecord, "country_id"),
          regionId: readNumberOrNull(residenceRecord, "region_id"),
          districtId: readNumberOrNull(residenceRecord, "district_id"),
          divisionId: readNumberOrNull(residenceRecord, "division_id"),
          wardId: readNumberOrNull(residenceRecord, "ward_id"),
          streetId: readNumberOrNull(residenceRecord, "street_id"),
          physicalAddress: readString(residenceRecord, "physical_address"),
          latitude: readString(residenceRecord, "latitude"),
          longitude: readString(residenceRecord, "longitude"),
          location: locationParts.join(", ") || "Location not specified"
        }
      : null,
    occupationEditor,
    wishesEditor,
    options: profileOptions,
    occupations: occupationList.length
      ? occupationList
      : [
          [occupationEditor.occupationType, occupationSectorName]
            .filter(Boolean)
            .join(" / ")
        ].filter(Boolean),
    educations: normalizeEducation(payload.educations),
    skills: normalizeList(payload.skills, ["skill", "name", "label"]),
    languages: normalizeList(payload.languages, ["language", "name", "label"]),
    pathways: normalizeList(payload.pathways, ["pathway", "name", "title", "label"]),
    wishes: wishesList.length
      ? wishesList
      : wishesEditor.wishes
          .map((wish) =>
            [wish.interestType, wish.description].filter(Boolean).join(" / ")
          )
          .filter(Boolean),
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
        first_name: payload.firstName,
        middle_name: payload.middleName || null,
        surname: payload.surname,
        birth_date: payload.birthDate,
        gender: payload.gender,
        religion_id: payload.religionId,
        email: payload.email || null,
        marital_status: payload.maritalStatus,
        emergency_contact: payload.emergencyContact,
        has_disability: payload.hasDisability,
        disability_type_id: payload.hasDisability === "Yes" ? payload.disabilityTypeId : null
      }
    });

    return this.getProfile();
  },

  async updateAddress(payload) {
    await apiClient.request<void>(apiEndpoints.youth.profileAddress, {
      method: "PATCH",
      body: {
        country_id: payload.countryId,
        region_id: payload.regionId,
        district_id: payload.districtId,
        division_id: payload.divisionId,
        ward_id: payload.wardId,
        street_id: payload.streetId,
        physical_address: payload.physicalAddress,
        latitude: payload.latitude || null,
        longitude: payload.longitude || null
      }
    });

    return this.getProfile();
  },

  async updateOccupation(payload) {
    await apiClient.request<void>(apiEndpoints.youth.profileOccupation, {
      method: "PATCH",
      body: {
        occupation_type: payload.occupationType,
        sector_category_id: payload.sectorCategoryId,
        occupation_sector_id: payload.occupationSectorId
      }
    });

    return this.getProfile();
  },

  async updateWishes(payload) {
    await apiClient.request<void>(apiEndpoints.youth.profileWishes, {
      method: "PATCH",
      body: {
        youth_wishes: payload.youthWishes,
        wishes:
          payload.youthWishes === "Yes"
            ? payload.wishes.map((wish) => ({
                id: wish.id,
                interest_type: wish.interestType,
                sector_category_id: wish.sectorCategoryId,
                wish_sector_id: wish.wishSectorId,
                description: wish.description,
                is_priority: wish.isPriority ?? true
              }))
            : []
      }
    });

    return this.getProfile();
  },

  async uploadAvatar(payload) {
    await apiClient.request<void>(apiEndpoints.youth.profileAvatar, {
      method: "POST",
      body: payload
    });

    return this.getProfile();
  }
};
