import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiEndpointPendingError } from "@/lib/api/errors";
import type { LoginCredentials, LoginResult, YouthSessionState } from "@/types/auth";
import { phase2AStubCapabilities } from "@/types/permissions";

export type AuthService = {
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  getSession: () => Promise<YouthSessionState>;
};

export const phase2AAuthenticatedSession: YouthSessionState = {
  status: "authenticated",
  isAuthenticated: true,
  user: {
    id: "phase-2a-user",
    youthProfileId: "phase-2a-youth-profile",
    name: "Youth Portal",
    roles: ["Youth"]
  },
  capabilities: phase2AStubCapabilities,
  registrationStatus: "APPROVED"
};

export const authService: AuthService = {
  async login(_credentials) {
    // TODO(Phase 2B backend): POST credentials to apiEndpoints.auth.login,
    // then load apiEndpoints.auth.session so the PWA can enforce whitelist,
    // registration status, role, and permission/capability checks.
    throw new ApiEndpointPendingError(apiEndpoints.auth.login);
  },

  async logout() {
    // TODO(Phase 2B backend): POST to apiEndpoints.auth.logout and clear the
    // frontend session cache.
    throw new ApiEndpointPendingError(apiEndpoints.auth.logout);
  },

  async getSession() {
    // TODO(Phase 2B backend): Replace this temporary authenticated session
    // with GET apiEndpoints.auth.session. The endpoint must return whether the
    // user is a whitelisted Youth, their registration_status, and capabilities.
    return phase2AAuthenticatedSession;
  }
};
