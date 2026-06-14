import type { Metadata } from "next";
import { OpportunityDetail } from "@/features/opportunities/OpportunityDetail";

export const metadata: Metadata = {
  title: "Opportunity details"
};

type OpportunityDetailPageProps = {
  params: {
    id: string;
  };
};

export default function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  return <OpportunityDetail id={params.id} />;
}
