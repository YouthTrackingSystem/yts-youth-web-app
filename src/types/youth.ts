export type DashboardSummary = {
  profileCompletion: number;
  openOpportunities: number;
  applicationsTotal: number;
  draftApplications: number;
};

export type YouthProfileOption = {
  id: number;
  name: string;
  categoryId?: number | null;
};

export type YouthProfileOccupationInput = {
  occupationType: string;
  sectorCategoryId: number | null;
  occupationSectorId: number | null;
};

export type YouthProfileWishInput = {
  id?: number;
  interestType: string;
  wishSectorId: number | null;
  sectorCategoryId: number | null;
  description: string;
  isPriority?: boolean;
};

export type YouthProfileWishesInput = {
  youthWishes: string;
  wishes: YouthProfileWishInput[];
};

export type YouthProfileEditorOptions = {
  religions: YouthProfileOption[];
  sectorCategories: YouthProfileOption[];
  occupationSectors: YouthProfileOption[];
  interestTypes: string[];
  occupationTypes: string[];
};

export type YouthProfileSummary = {
  id: string;
  name: string;
  firstName: string;
  middleName?: string;
  surname: string;
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  religionId: number | null;
  maritalStatus?: string;
  emergencyContact?: string;
  hasDisability?: string;
  disabilityTypeId: number | null;
  journeyStatus?: string;
  registrationStatus: string;
  profileCompletion: number;
  residence: {
    countryId: number | null;
    regionId: number | null;
    districtId: number | null;
    divisionId: number | null;
    wardId: number | null;
    streetId: number | null;
    physicalAddress?: string;
    latitude?: string;
    longitude?: string;
    location: string;
  } | null;
  occupationEditor: YouthProfileOccupationInput;
  wishesEditor: YouthProfileWishesInput;
  options: YouthProfileEditorOptions;
  occupations: string[];
  educations: string[];
  skills: string[];
  languages: string[];
  pathways: string[];
  wishes: string[];
  documents: string[];
};

export type YouthProfilePersonalInput = {
  firstName: string;
  middleName: string;
  surname: string;
  birthDate: string;
  gender: string;
  religionId: number | null;
  email: string;
  maritalStatus: string;
  emergencyContact: string;
  hasDisability: string;
  disabilityTypeId: number | null;
};

export type YouthProfileAddressInput = {
  countryId: number | null;
  regionId: number | null;
  districtId: number | null;
  divisionId: number | null;
  wardId: number | null;
  streetId: number | null;
  physicalAddress: string;
  latitude: string;
  longitude: string;
};

export type OpportunitySummary = {
  id: string;
  title: string;
  description?: string;
  statusCode: string;
  statusLabel: string;
  typeLabel: string;
  stakeholderName: string;
  sectorName: string;
  location: string;
  stipendAmount?: number;
  opensAt?: string;
  closesAt?: string;
  startsAt?: string;
  endsAt?: string;
};

export type OpportunityApplicationState = {
  hasApplied: boolean;
  applicationId?: string;
  status?: string;
  canEdit: boolean;
};

export type YouthApplicationSummary = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  stakeholderName: string;
  statusCode: string;
  statusLabel: string;
  coverNote?: string;
  portfolioUrl?: string;
  notes?: string;
  hasCv: boolean;
  appliedAt?: string;
  decisionAt?: string;
  isDraft: boolean;
};

export type YouthApplicationDraftInput = {
  coverNote: string;
  portfolioUrl: string;
  notes: string;
};

export type YouthApplicationCreateDraftInput = YouthApplicationDraftInput & {
  opportunityId: string;
};
