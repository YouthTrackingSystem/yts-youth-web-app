import type { Metadata } from "next";
import { LoginPageContent } from "@/features/auth/LoginPageContent";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return <LoginPageContent />;
}
