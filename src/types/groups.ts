export type YouthGroupSummaryStats = {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  savingsGroups: number;
};

export type YouthGroupSummary = {
  id: string;
  name: string;
  groupType: string;
  status: string;
  membersCount: number;
  joinedAt?: string;
};

export type YouthGroupsResponse = {
  summary: YouthGroupSummaryStats;
  groups: YouthGroupSummary[];
};

export type YouthGroupFinancialSummary = {
  purchasedShares?: number;
  soldShares?: number;
  netShares?: number;
  netAmount?: number;
  deposits?: number;
  withdrawals?: number;
  balance?: number;
};

export type YouthGroupDetail = YouthGroupSummary & {
  startDate?: string;
  physicalAddress?: string;
  supportNeeded?: string;
  location: string;
  latitude?: string;
  longitude?: string;
  membershipId?: string;
  membershipRole?: string;
  exitDate?: string;
  shares: YouthGroupFinancialSummary | null;
  savings: YouthGroupFinancialSummary | null;
};
