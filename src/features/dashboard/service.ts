import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { DashboardSummary } from "@/types/youth";

export type DashboardService = {
  getSummary: () => Promise<DashboardSummary>;
};

export const dashboardService: DashboardService = {
  async getSummary() {
    const response = await apiClient.request<unknown>(apiEndpoints.youth.dashboard);
    const envelope = response as Record<string, unknown>;
    const payload = ((envelope?.data ?? response) ?? {}) as Record<string, unknown>;
    const applications = (payload.applications ?? {}) as Record<string, unknown>;
    const numberValue = (...keys: string[]) => {
      for (const key of keys) {
        const value = payload[key];
        if (typeof value === "number") return value;
        if (typeof value === "string" && value.trim() !== "") {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) return parsed;
        }
      }
      return 0;
    };

    return {
      profileCompletion: numberValue(
        "profile_completion_percentage",
        "profile_completion",
        "profileCompletion"
      ),
      openOpportunities: numberValue(
        "available_opportunities",
        "open_opportunities",
        "openOpportunities",
        "opportunities_count"
      ),
      applicationsTotal:
        typeof applications.total === "number" ? applications.total : 0,
      draftApplications:
        typeof applications.draft === "number" ? applications.draft : 0
    };
  }
};
