import type { Metadata } from "next";
import { GroupDetail } from "@/features/groups/GroupDetail";

export const metadata: Metadata = {
  title: "Youth Group"
};

type GroupDetailPageProps = {
  params: {
    id: string;
  };
};

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  return <GroupDetail id={params.id} />;
}
