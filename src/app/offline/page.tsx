import type { Metadata } from "next";
import { OfflinePageContent } from "@/features/pwa/OfflinePageContent";

export const metadata: Metadata = {
  title: "Offline"
};

export default function OfflinePage() {
  return <OfflinePageContent />;
}
