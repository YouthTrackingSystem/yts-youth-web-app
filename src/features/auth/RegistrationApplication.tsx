"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { YouthSessionState } from "@/types/auth";
import { authService } from "./service";

export function RegistrationApplication() {
  const router = useRouter();
  const [session, setSession] = useState<YouthSessionState | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    authService
      .getSession()
      .then((nextSession) => {
        if (nextSession.status === "authenticated") {
          router.replace("/dashboard");
          return;
        }

        if (nextSession.status === "unauthenticated") {
          router.replace("/login");
          return;
        }

        setSession(nextSession);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await authService.logout().catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  if (!session || session.status !== "blocked") {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        Loading registration status
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        <ClipboardCheck size={24} />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-ink">
        Registration application
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {session.reason === "not_whitelisted"
          ? "No youth profile is linked to this account."
          : session.rejectedReason
            ? session.rejectedReason
            : `Your registration status is ${session.registrationStatus.toLowerCase()}.`} {" "}
        Complete or follow up on your youth registration before accessing the dashboard.
      </p>
      <Button
        className="mt-6 w-full"
        disabled={isLoggingOut}
        onClick={handleLogout}
        variant="secondary"
      >
        {isLoggingOut ? (
          <Loader2 className="mr-2 animate-spin" size={18} />
        ) : (
          <LogOut className="mr-2" size={18} />
        )}
        Sign out
      </Button>
    </section>
  );
}
