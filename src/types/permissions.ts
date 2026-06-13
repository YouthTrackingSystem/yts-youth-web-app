export type YouthPermission =
  | "auth.login"
  | "auth.logout"
  | "youth.session.view"
  | "youth.dashboard.view"
  | "youth.profile.view"
  | "youth.profile.update"
  | "youth.profile.avatar.upload"
  | "youth.opportunities.view"
  | "youth.applications.view"
  | "youth.applications.create"
  | "youth.applications.updateDraft"
  | "youth.applications.submit"
  | "youth.applications.cv.manage";

export type YouthCapabilities = {
  auth: {
    canLogin: boolean;
    canLogout: boolean;
  };
  dashboard: {
    canView: boolean;
  };
  profile: {
    canView: boolean;
    canUpdate: boolean;
    canUploadAvatar: boolean;
    editableFields: string[];
  };
  opportunities: {
    canView: boolean;
    canApply: boolean;
  };
  applications: {
    canView: boolean;
    canCreate: boolean;
    canUpdateDraft: boolean;
    canSubmit: boolean;
    canManageCv: boolean;
  };
};

export const emptyYouthCapabilities: YouthCapabilities = {
  auth: {
    canLogin: false,
    canLogout: false
  },
  dashboard: {
    canView: false
  },
  profile: {
    canView: false,
    canUpdate: false,
    canUploadAvatar: false,
    editableFields: []
  },
  opportunities: {
    canView: false,
    canApply: false
  },
  applications: {
    canView: false,
    canCreate: false,
    canUpdateDraft: false,
    canSubmit: false,
    canManageCv: false
  }
};

export const phase2AStubCapabilities: YouthCapabilities = {
  auth: {
    canLogin: true,
    canLogout: true
  },
  dashboard: {
    canView: true
  },
  profile: {
    canView: true,
    canUpdate: true,
    canUploadAvatar: true,
    editableFields: [
      "email",
      "birth_date",
      "religion_id",
      "marital_status",
      "emergency_contact",
      "street_id",
      "physical_address",
      "latitude",
      "longitude"
    ]
  },
  opportunities: {
    canView: true,
    canApply: true
  },
  applications: {
    canView: true,
    canCreate: true,
    canUpdateDraft: true,
    canSubmit: true,
    canManageCv: true
  }
};
