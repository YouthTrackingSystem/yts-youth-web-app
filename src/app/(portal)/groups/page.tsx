import type { Metadata } from "next";
import { GroupsList } from "@/features/groups/GroupsList";

export const metadata: Metadata = {
  title: "Youth Groups"
};

export default function GroupsPage() {
  return <GroupsList />;
}
