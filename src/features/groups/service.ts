import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  YouthGroupDetail,
  YouthGroupFinancialSummary,
  YouthGroupSummary,
  YouthGroupsResponse
} from "@/types/groups";

export type GroupsService = {
  list: () => Promise<YouthGroupsResponse>;
  getById: (id: string) => Promise<YouthGroupDetail>;
};

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value !== null && typeof value === "object" ? (value as ApiRecord) : {};
}

function readString(record: ApiRecord, key: string) {
  const value = record[key];

  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);

  return undefined;
}

function readNumber(record: ApiRecord, key: string) {
  const value = record[key];
  const number = typeof value === "number" ? value : Number(value);

  return Number.isFinite(number) ? number : 0;
}

function normalizeGroup(value: unknown): YouthGroupSummary {
  const group = asRecord(value);

  return {
    id: readString(group, "id") ?? "",
    name: readString(group, "name") ?? "Unnamed group",
    groupType: readString(group, "group_type") ?? "Not specified",
    status: readString(group, "status") ?? "Unknown",
    membersCount: readNumber(group, "members_count"),
    joinedAt: readString(group, "joined_at")
  };
}

function normalizeFinancialSummary(value: unknown): YouthGroupFinancialSummary | null {
  if (value === null || value === undefined) return null;

  const summary = asRecord(value);

  return {
    purchasedShares: readNumber(summary, "purchased_shares"),
    soldShares: readNumber(summary, "sold_shares"),
    netShares: readNumber(summary, "net_shares"),
    netAmount: readNumber(summary, "net_amount"),
    deposits: readNumber(summary, "deposits"),
    withdrawals: readNumber(summary, "withdrawals"),
    balance: readNumber(summary, "balance")
  };
}

function formatLocation(value: unknown) {
  const location = asRecord(value);
  const parts = ["street", "ward", "division", "district", "region", "country"]
    .map((key) => readString(location, key))
    .filter((part): part is string => Boolean(part));

  return parts.join(", ");
}

export const groupsService: GroupsService = {
  async list() {
    const response = await apiClient.request<unknown>(apiEndpoints.youth.groups, {
      cache: "no-store"
    });
    const payload = asRecord(response);
    const summary = asRecord(payload.summary);
    const groups = Array.isArray(payload.groups) ? payload.groups : [];

    return {
      summary: {
        totalGroups: readNumber(summary, "total_groups"),
        activeGroups: readNumber(summary, "active_groups"),
        totalMembers: readNumber(summary, "total_members"),
        savingsGroups: readNumber(summary, "savings_groups")
      },
      groups: groups.map(normalizeGroup).filter(({ id }) => id)
    };
  },

  async getById(id) {
    const response = await apiClient.request<unknown>(apiEndpoints.youth.group(id), {
      cache: "no-store"
    });
    const payload = asRecord(response);
    const group = asRecord(payload.group);
    const membership = asRecord(payload.membership);
    const role = asRecord(membership.role);
    const location = asRecord(group.location);
    const summary = normalizeGroup({
      ...group,
      joined_at: membership.joined_at
    });

    return {
      ...summary,
      startDate: readString(group, "start_date"),
      physicalAddress: readString(group, "physical_address"),
      supportNeeded: readString(group, "support_needed"),
      location: formatLocation(location),
      latitude: readString(location, "latitude"),
      longitude: readString(location, "longitude"),
      membershipId: readString(membership, "id"),
      membershipRole: readString(role, "name"),
      exitDate: readString(membership, "exit_date"),
      shares: normalizeFinancialSummary(payload.shares),
      savings: normalizeFinancialSummary(payload.savings)
    };
  }
};
