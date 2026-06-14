export type DashboardSummary = {
  profileCompletion: number;
  openOpportunities: number;
  applicationsTotal: number;
  draftApplications: number;
};

export type YouthProfileSummary = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  status: string;
  profileCompletion: number;
};

export type OpportunitySummary = {
  id: string;
  title: string;
  description?: string;
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
  appliedAt?: string;
  decisionAt?: string;
  isDraft: boolean;
};

export type YouthApplicationDraftInput = {
  coverNote: string;
  portfolioUrl: string;
  notes: string;
};
