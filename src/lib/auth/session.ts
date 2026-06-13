import { authService, phase2AAuthenticatedSession } from "@/features/auth/service";
import type { YouthSessionState } from "@/types/auth";

export const placeholderSession: YouthSessionState = phase2AAuthenticatedSession;

export async function getCurrentYouthSession() {
  return authService.getSession();
}
