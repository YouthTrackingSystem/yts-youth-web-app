export const apiEndpoints = {
  auth: {
    login: "/api/youth/auth/login",
    logout: "/api/youth/auth/logout",
    session: "/api/youth/session-state"
  },
  youth: {
    dashboard: "/api/youth/dashboard",
    profile: "/api/youth/profile",
    profilePersonal: "/api/youth/profile/personal",
    profileAddress: "/api/youth/profile/address",
    profileAvatar: "/api/youth/profile/avatar",
    opportunities: "/api/youth/opportunities",
    opportunity: (id: string) => `/api/youth/opportunities/${id}`,
    opportunityApplicationState: (id: string) =>
      `/api/youth/opportunities/${id}/application-state`,
    applications: "/api/youth/applications",
    application: (id: string) => `/api/youth/applications/${id}`,
    applicationSubmit: (id: string) => `/api/youth/applications/${id}/submit`,
    applicationCv: (id: string) => `/api/youth/applications/${id}/cv`
  }
} as const;
