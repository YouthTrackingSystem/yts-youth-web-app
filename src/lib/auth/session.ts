import { authService } from "@/features/auth/service";

export async function getCurrentYouthSession() {
  return authService.getSession();
}
