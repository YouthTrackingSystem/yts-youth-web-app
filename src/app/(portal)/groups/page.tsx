import type { Metadata } from "next";
import { Users } from "lucide-react";
import { ReleasePlaceholderPage } from "@/features/release-placeholders/ReleasePlaceholderPage";

export const metadata: Metadata = {
  title: "Youth Groups"
};

export default function GroupsPage() {
  return (
    <ReleasePlaceholderPage
      icon={Users}
      message="Your youth groups will appear here once group access is enabled."
      title="Youth Groups"
    />
  );
}
