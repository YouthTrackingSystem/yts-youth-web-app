import type { Metadata } from "next";
import { ApplicationDetail } from "@/features/applications/ApplicationDetail";

export const metadata: Metadata = {
  title: "Application details"
};

type ApplicationDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  return <ApplicationDetail id={params.id} />;
}
