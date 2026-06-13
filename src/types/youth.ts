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
  typeLabel?: string;
  stakeholderName?: string;
  closesAt?: string;
  hasApplied: boolean;
};

export type YouthApplicationSummary = {
  id: string;
  opportunityTitle: string;
  statusCode: string;
  statusLabel: string;
  appliedAt?: string;
  isDraft: boolean;
};
