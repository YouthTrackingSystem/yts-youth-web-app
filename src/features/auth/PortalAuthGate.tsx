"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/PortalShell";
import type { YouthSessionState } from "@/types/auth";
import { authService } from "./service";

type PortalAuthGateProps = {
  children: ReactNode;
};

export function PortalAuthGate({ children }: PortalAuthGateProps) {
  const router = useRouter();
  const [session, setSession] = useState<YouthSessionState | null>(null);

  useEffect(() => {
    authService
      .getSession()
      .then((nextSession) => {
        if (nextSession.status === "unauthenticated") {
          router.replace("/login");
          return;
        }

        if (nextSession.status === "blocked") {
          router.replace("/registration-application");
          return;
        }

        setSession(nextSession);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!session || session.status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mist">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Loader2 className="animate-spin text-brand-700" size={20} />
          Loading your session
        </div>
      </main>
    );
  }

  return <PortalShell session={session}>{children}</PortalShell>;
}
