import type { ReactNode } from "react";
import { PortalAuthGate } from "@/features/auth/PortalAuthGate";

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  return <PortalAuthGate>{children}</PortalAuthGate>;
}
