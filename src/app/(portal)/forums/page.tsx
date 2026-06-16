import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { ReleasePlaceholderPage } from "@/features/release-placeholders/ReleasePlaceholderPage";

export const metadata: Metadata = {
  title: "Youth Forums"
};

export default function ForumsPage() {
  return (
    <ReleasePlaceholderPage
      icon={MessageSquare}
      message="Youth forums and discussions will appear here once forum access is enabled."
      title="Youth Forums"
    />
  );
}
