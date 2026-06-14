import type { Metadata } from "next";
import { OpportunitiesList } from "@/features/opportunities/OpportunitiesList";

export const metadata: Metadata = {
  title: "Opportunities"
};

export default function OpportunitiesPage() {
  return <OpportunitiesList />;
}
