import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { canViewApplications } from "@/lib/auth/guards";
import { getCurrentYouthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Applications"
};

export default async function ApplicationsPage() {
  const session = await getCurrentYouthSession();

  if (!canViewApplications(session.capabilities)) {
    redirect("/dashboard");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-xl font-semibold text-ink">My applications</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Application history, draft editing, status tracking, and CV handling
        will connect after the Laravel youth applications API is available.
      </p>
    </section>
  );
}
