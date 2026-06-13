import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiEndpointPendingError } from "@/lib/api/errors";
import type { YouthProfileSummary } from "@/types/youth";

export type ProfileService = {
  getProfile: () => Promise<YouthProfileSummary>;
  updatePersonal: (payload: unknown) => Promise<YouthProfileSummary>;
  updateAddress: (payload: unknown) => Promise<YouthProfileSummary>;
  uploadAvatar: (payload: FormData) => Promise<YouthProfileSummary>;
};

export const profileService: ProfileService = {
  async getProfile() {
    // TODO(Phase 2B backend): GET apiEndpoints.youth.profile.
    // Should mirror YouthMyProfileController@index as JSON for the logged-in
    // youth only, including completion score and editable sections.
    throw new ApiEndpointPendingError(apiEndpoints.youth.profile);
  },

  async updatePersonal(_payload) {
    // TODO(Phase 2B backend): PATCH apiEndpoints.youth.profilePersonal.
    // Should enforce the same permitted fields as the core profile UI.
    throw new ApiEndpointPendingError(apiEndpoints.youth.profilePersonal);
  },

  async updateAddress(_payload) {
    // TODO(Phase 2B backend): PATCH apiEndpoints.youth.profileAddress.
    // Should update only the authenticated youth profile address.
    throw new ApiEndpointPendingError(apiEndpoints.youth.profileAddress);
  },

  async uploadAvatar(_payload) {
    // TODO(Phase 2B backend): POST multipart form data to
    // apiEndpoints.youth.profileAvatar.
    throw new ApiEndpointPendingError(apiEndpoints.youth.profileAvatar);
  }
};
