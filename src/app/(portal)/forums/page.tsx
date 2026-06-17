import type { Metadata } from "next";
import { ReleasePlaceholderPage } from "@/features/release-placeholders/ReleasePlaceholderPage";

export const metadata: Metadata = {
  title: "Youth Forums"
};

export default function ForumsPage() {
  return (
    <ReleasePlaceholderPage
      icon="forums"
      messageKey="forums.message"
      titleKey="forums.title"
    />
  );
}
