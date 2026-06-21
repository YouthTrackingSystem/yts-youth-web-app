export const apiEndpoints = {
  auth: {
    login: "/api/youth/auth/login",
    logout: "/api/youth/auth/logout",
    session: "/api/youth/session-state"
  },
  youth: {
    dashboard: "/api/youth/dashboard",
    registration: "/api/youth/registration-application",
    registrationPersonal: "/api/youth/registration-application/personal",
    registrationContact: "/api/youth/registration-application/contact",
    registrationLocation: "/api/youth/registration-application/location",
    registrationSocioEconomic: "/api/youth/registration-application/socio-economic",
    registrationSubmit: "/api/youth/registration-application/submit",
    profile: "/api/youth/profile",
    profilePersonal: "/api/youth/profile/personal",
    profileAddress: "/api/youth/profile/address",
    profileAvatar: "/api/youth/profile/avatar",
    profileOccupation: "/api/youth/profile/occupation",
    profileWishes: "/api/youth/profile/wishes",
    groups: "/api/youth/groups",
    group: (id: string) => `/api/youth/groups/${id}`,
    forums: "/api/youth/forums",
    forum: (id: string) => `/api/youth/forums/${id}`,
    opportunities: "/api/youth/opportunities",
    opportunity: (id: string) => `/api/youth/opportunities/${id}`,
    opportunityApplicationState: (id: string) =>
      `/api/youth/opportunities/${id}/application-state`,
    applications: "/api/youth/applications",
    application: (id: string) => `/api/youth/applications/${id}`,
    applicationSubmit: (id: string) => `/api/youth/applications/${id}/submit`,
    applicationCv: (id: string) => `/api/youth/applications/${id}/cv`
  },
  locations: {
    countries: "/api/locations/countries",
    regions: "/api/locations/regions",
    districts: "/api/locations/districts",
    divisions: "/api/locations/divisions",
    wards: "/api/locations/wards",
    streets: "/api/locations/streets"
  }
} as const;
