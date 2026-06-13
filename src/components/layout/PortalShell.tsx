import type { ReactNode } from "react";
import type { YouthSessionState } from "@/types/auth";
import { OfflineNotice } from "@/components/feedback/OfflineNotice";
import { BottomNav } from "./BottomNav";
import { AppHeader } from "./AppHeader";

type PortalShellProps = {
  children: ReactNode;
  session: YouthSessionState;
};

export function PortalShell({ children, session }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-mist">
      <OfflineNotice />
      <AppHeader session={session} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
