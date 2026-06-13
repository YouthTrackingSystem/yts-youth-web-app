import type { YouthCapabilities } from "./permissions";

export type YouthRegistrationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "REJECTED"
  | "APPROVED"
  | "UNKNOWN";

export type YouthSessionUser = {
  id: string;
  youthProfileId?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
};

export type YouthSessionState =
  | {
      status: "loading";
      isAuthenticated: false;
      user: null;
      capabilities: null;
      registrationStatus: "UNKNOWN";
    }
  | {
      status: "unauthenticated";
      isAuthenticated: false;
      user: null;
      capabilities: null;
      registrationStatus: "UNKNOWN";
    }
  | {
      status: "blocked";
      isAuthenticated: true;
      user: YouthSessionUser;
      capabilities: YouthCapabilities;
      registrationStatus: Exclude<YouthRegistrationStatus, "APPROVED">;
      reason: "not_whitelisted" | "registration_incomplete" | "awaiting_approval";
    }
  | {
      status: "authenticated";
      isAuthenticated: true;
      user: YouthSessionUser;
      capabilities: YouthCapabilities;
      registrationStatus: "APPROVED";
    };

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export type LoginResult = {
  session: YouthSessionState;
};
