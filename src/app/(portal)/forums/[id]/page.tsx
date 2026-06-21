import type { Metadata } from "next";
import { ForumDetail } from "@/features/forums/ForumDetail";

export const metadata: Metadata = {
  title: "Youth Forum"
};

type ForumDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ForumDetailPage({ params }: ForumDetailPageProps) {
  return <ForumDetail id={params.id} />;
}
