import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { canViewOpportunities } from "@/lib/auth/guards";
import { getCurrentYouthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Opportunities"
};

export default async function OpportunitiesPage() {
  const session = await getCurrentYouthSession();

  if (!canViewOpportunities(session.capabilities)) {
    redirect("/dashboard");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-xl font-semibold text-ink">Opportunities</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Published opportunity browsing and application state checks will connect
        after the Laravel youth opportunities API is available.
      </p>
    </section>
  );
}
