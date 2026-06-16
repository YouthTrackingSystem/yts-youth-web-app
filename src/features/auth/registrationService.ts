import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  ContactStep,
  LocationStep,
  PersonalStep,
  RegistrationApplication,
  RegistrationResponse,
  SelectOption,
  SocioEconomicStep
} from "@/types/registration";

function withQuery(path: string, key: string, value: number) {
  return `${path}?${new URLSearchParams({ [key]: String(value) }).toString()}`;
}

export const registrationService = {
  get() {
    return apiClient.request<RegistrationApplication>(apiEndpoints.youth.registration, {
      cache: "no-store"
    });
  },
  savePersonal(data: PersonalStep) {
    return apiClient.request<RegistrationResponse>(apiEndpoints.youth.registrationPersonal, {
      method: "PATCH",
      body: data
    });
  },
  saveContact(data: Omit<ContactStep, "primary_phone">) {
    return apiClient.request<RegistrationResponse>(apiEndpoints.youth.registrationContact, {
      method: "PATCH",
      body: data
    });
  },
  saveLocation(data: Omit<LocationStep, "names">) {
    return apiClient.request<RegistrationResponse>(apiEndpoints.youth.registrationLocation, {
      method: "PATCH",
      body: data
    });
  },
  saveSocioEconomic(data: SocioEconomicStep) {
    return apiClient.request<RegistrationResponse>(apiEndpoints.youth.registrationSocioEconomic, {
      method: "PATCH",
      body: data
    });
  },
  submit() {
    return apiClient.request<RegistrationResponse>(apiEndpoints.youth.registrationSubmit, {
      method: "POST"
    });
  },
  countries() {
    return apiClient.request<SelectOption[]>(apiEndpoints.locations.countries, { cache: "no-store" });
  },
  regions(countryId: number) {
    return apiClient.request<SelectOption[]>(
      withQuery(apiEndpoints.locations.regions, "country_id", countryId),
      { cache: "no-store" }
    );
  },
  districts(regionId: number) {
    return apiClient.request<SelectOption[]>(
      withQuery(apiEndpoints.locations.districts, "region_id", regionId),
      { cache: "no-store" }
    );
  },
  divisions(districtId: number) {
    return apiClient.request<SelectOption[]>(
      withQuery(apiEndpoints.locations.divisions, "district_id", districtId),
      { cache: "no-store" }
    );
  },
  wards(divisionId: number) {
    return apiClient.request<SelectOption[]>(
      withQuery(apiEndpoints.locations.wards, "division_id", divisionId),
      { cache: "no-store" }
    );
  },
  streets(wardId: number) {
    return apiClient.request<SelectOption[]>(
      withQuery(apiEndpoints.locations.streets, "ward_id", wardId),
      { cache: "no-store" }
    );
  }
};
