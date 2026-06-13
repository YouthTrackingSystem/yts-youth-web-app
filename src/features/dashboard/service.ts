import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiEndpointPendingError } from "@/lib/api/errors";
import type { DashboardSummary } from "@/types/youth";

export type DashboardService = {
  getSummary: () => Promise<DashboardSummary>;
};

export const dashboardService: DashboardService = {
  async getSummary() {
    // TODO(Phase 2B backend): GET apiEndpoints.youth.dashboard.
    // Expected data: profile completion, opportunity count, application count,
    // draft count, and any youth-facing alerts from the core youth module.
    throw new ApiEndpointPendingError(apiEndpoints.youth.dashboard);
  }
};
