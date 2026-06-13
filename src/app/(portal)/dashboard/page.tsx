import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClipboardList, Sparkles, UserRound } from "lucide-react";
import { canViewDashboard } from "@/lib/auth/guards";
import { getCurrentYouthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard"
};

const summaryCards = [
  {
    title: "Profile",
    description: "Personal details and permitted updates will appear here.",
    icon: UserRound
  },
  {
    title: "Opportunities",
    description: "Eligible opportunities from the YTS API will appear here.",
    icon: Sparkles
  },
  {
    title: "Applications",
    description: "Submitted applications and statuses will appear here.",
    icon: ClipboardList
  }
];

export default async function DashboardPage() {
  const session = await getCurrentYouthSession();

  if (!canViewDashboard(session.capabilities)) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-brand-700 px-5 py-6 text-white shadow-soft">
        <p className="text-sm font-medium text-brand-100">Welcome back</p>
        <h1 className="mt-2 text-2xl font-semibold">Youth dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-50">
          This Phase 2A shell is ready for the future dashboard API. Offline
          viewing will use cached dashboard data once Phase 2B endpoints exist.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              key={card.title}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon size={20} />
              </div>
              <h2 className="text-base font-semibold text-ink">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
