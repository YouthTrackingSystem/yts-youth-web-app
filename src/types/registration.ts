export type RegistrationStatus = "DRAFT" | "SUBMITTED" | "REJECTED" | "APPROVED";

export type LocationLevel =
  | "country"
  | "region"
  | "district"
  | "division"
  | "ward"
  | "street";

export type SelectOption = {
  id: number;
  name: string;
};

export type RegistrationCompletion = {
  percentage: number;
  sections: Array<{ key: string; label: string; completed: boolean }>;
  missing_sections: string[];
};

export type PersonalStep = {
  first_name: string;
  middle_name: string;
  surname: string;
  birth_date: string;
  gender: string;
};

export type ContactStep = {
  primary_phone: string;
  email: string;
  emergency_contact: string;
};

export type LocationStep = {
  country_id: number | null;
  region_id: number | null;
  district_id: number | null;
  division_id: number | null;
  ward_id: number | null;
  street_id: number | null;
  physical_address: string;
  latitude: string | number | null;
  longitude: string | number | null;
  names: Record<LocationLevel, string | null>;
};

export type SocioEconomicStep = {
  religion_id: number | null;
  marital_status: string;
  occupation_type: string;
  occupation_sector_id: number | null;
  has_disability: string;
  disability_type_id: number | null;
  youth_wishes: string;
  wishes: YouthWishStep[];
};

export type YouthWishStep = {
  id?: number;
  interest_type: string;
  wish_sector_id: number | null;
  sector_category_id: number | null;
  description: string;
  is_priority?: boolean;
  sector?: {
    id: number;
    name: string;
    category_id: number | null;
  } | null;
};

export type RegistrationApplication = {
  status: string;
  registration_status: RegistrationStatus;
  rejected_reason: string | null;
  can_edit: boolean;
  completion: RegistrationCompletion;
  scope: {
    assigned_level: LocationLevel | null;
    assigned_id: number | null;
    editable_levels: LocationLevel[];
  };
  personal: PersonalStep;
  contact: ContactStep;
  location: LocationStep;
  socio_economic: SocioEconomicStep;
  options: {
    religions: SelectOption[];
    disability_types: SelectOption[];
    sector_categories: SelectOption[];
    occupation_sectors: Array<SelectOption & { category_id: number | null }>;
  };
};

export type RegistrationResponse = {
  message: string;
  registration: RegistrationApplication;
};
