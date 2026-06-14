import type { Metadata } from "next";
import { RegistrationApplication } from "@/features/auth/RegistrationApplication";

export const metadata: Metadata = {
  title: "Registration application"
};

export default function RegistrationApplicationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <div className="w-full max-w-md">
        <RegistrationApplication />
      </div>
    </main>
  );
}
