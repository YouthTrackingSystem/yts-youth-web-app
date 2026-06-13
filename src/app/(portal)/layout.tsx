import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/PortalShell";
import { canAccessPortal } from "@/lib/auth/guards";
import { getCurrentYouthSession } from "@/lib/auth/session";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const session = await getCurrentYouthSession();

  if (!canAccessPortal(session)) {
    redirect("/login");
  }

  return <PortalShell session={session}>{children}</PortalShell>;
}
