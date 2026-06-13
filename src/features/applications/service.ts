import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiEndpointPendingError } from "@/lib/api/errors";
import type { YouthApplicationSummary } from "@/types/youth";

export type ApplicationsService = {
  list: () => Promise<YouthApplicationSummary[]>;
  getById: (id: string) => Promise<YouthApplicationSummary>;
  create: (payload: unknown) => Promise<YouthApplicationSummary>;
  updateDraft: (id: string, payload: unknown) => Promise<YouthApplicationSummary>;
  submitDraft: (id: string) => Promise<YouthApplicationSummary>;
  uploadCv: (id: string, payload: FormData) => Promise<YouthApplicationSummary>;
};

export const applicationsService: ApplicationsService = {
  async list() {
    // TODO(Phase 2B backend): GET apiEndpoints.youth.applications.
    // Must return only applications where youth_id belongs to the current user.
    throw new ApiEndpointPendingError(apiEndpoints.youth.applications);
  },

  async getById(id) {
    // TODO(Phase 2B backend): GET apiEndpoints.youth.application(id).
    throw new ApiEndpointPendingError(apiEndpoints.youth.application(id));
  },

  async create(_payload) {
    // TODO(Phase 2B backend): POST apiEndpoints.youth.applications.
    // Must support save_as=draft and save_as=submit, duplicate prevention,
    // and optional CV upload or follow-up CV upload.
    throw new ApiEndpointPendingError(apiEndpoints.youth.applications);
  },

  async updateDraft(id, _payload) {
    // TODO(Phase 2B backend): PATCH apiEndpoints.youth.application(id).
    // Must reject updates unless the application status is draft.
    throw new ApiEndpointPendingError(apiEndpoints.youth.application(id));
  },

  async submitDraft(id) {
    // TODO(Phase 2B backend): POST apiEndpoints.youth.applicationSubmit(id).
    // Must move draft to applied and set applied_at.
    throw new ApiEndpointPendingError(apiEndpoints.youth.applicationSubmit(id));
  },

  async uploadCv(id, _payload) {
    // TODO(Phase 2B backend): POST multipart form data to
    // apiEndpoints.youth.applicationCv(id), scoped to the current youth.
    throw new ApiEndpointPendingError(apiEndpoints.youth.applicationCv(id));
  }
};
