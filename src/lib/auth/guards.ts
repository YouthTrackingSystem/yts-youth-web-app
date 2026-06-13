import type { YouthCapabilities } from "@/types/permissions";
import type { YouthSessionState } from "@/types/auth";

export function canAccessPortal(session: YouthSessionState) {
  return session.status === "authenticated";
}

export function canViewDashboard(capabilities: YouthCapabilities | null) {
  return Boolean(capabilities?.dashboard.canView);
}

export function canViewProfile(capabilities: YouthCapabilities | null) {
  return Boolean(capabilities?.profile.canView);
}

export function canViewOpportunities(capabilities: YouthCapabilities | null) {
  return Boolean(capabilities?.opportunities.canView);
}

export function canViewApplications(capabilities: YouthCapabilities | null) {
  return Boolean(capabilities?.applications.canView);
}
