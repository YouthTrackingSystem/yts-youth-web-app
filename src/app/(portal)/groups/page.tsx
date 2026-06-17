import type { Metadata } from "next";
import { ReleasePlaceholderPage } from "@/features/release-placeholders/ReleasePlaceholderPage";

export const metadata: Metadata = {
  title: "Youth Groups"
};

export default function GroupsPage() {
  return (
    <ReleasePlaceholderPage
      icon="groups"
      messageKey="groups.message"
      titleKey="groups.title"
    />
  );
}
