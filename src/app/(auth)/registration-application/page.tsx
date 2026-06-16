import type { Metadata } from "next";
import { RegistrationApplication } from "@/features/auth/RegistrationApplication";

export const metadata: Metadata = {
  title: "Registration application"
};

export default function RegistrationApplicationPage() {
  return (
    <main className="min-h-screen bg-mist px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <RegistrationApplication />
      </div>
    </main>
  );
}
