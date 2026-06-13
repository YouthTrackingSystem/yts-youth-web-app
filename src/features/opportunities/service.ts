import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiEndpointPendingError } from "@/lib/api/errors";
import type { OpportunitySummary } from "@/types/youth";

export type OpportunitiesService = {
  list: () => Promise<OpportunitySummary[]>;
  getById: (id: string) => Promise<OpportunitySummary>;
  getApplicationState: (id: string) => Promise<{ hasApplied: boolean }>;
};

export const opportunitiesService: OpportunitiesService = {
  async list() {
    // TODO(Phase 2B backend): GET apiEndpoints.youth.opportunities.
    // Must return only active, published, not-closed opportunities available
    // to youth, matching YouthApplicationOpportunityController logic.
    throw new ApiEndpointPendingError(apiEndpoints.youth.opportunities);
  },

  async getById(id) {
    // TODO(Phase 2B backend): GET apiEndpoints.youth.opportunity(id).
    // Must include stakeholder, type, location, dates, and current youth
    // application state.
    throw new ApiEndpointPendingError(apiEndpoints.youth.opportunity(id));
  },

  async getApplicationState(id) {
    // TODO(Phase 2B backend): GET
    // apiEndpoints.youth.opportunityApplicationState(id).
    throw new ApiEndpointPendingError(
      apiEndpoints.youth.opportunityApplicationState(id)
    );
  }
};
