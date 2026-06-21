import type { Metadata } from "next";
import { ForumsList } from "@/features/forums/ForumsList";

export const metadata: Metadata = {
  title: "Youth Forums"
};

export default function ForumsPage() {
  return <ForumsList />;
}
