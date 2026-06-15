"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ClipboardList, Loader2, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InstallBanner } from "@/features/pwa/InstallBanner";
import { ApiError } from "@/lib/api/errors";
import type { DashboardSummary } from "@/types/youth";
import { dashboardService } from "./service";

export function DashboardView() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);

    try {
      setSummary(await dashboardService.getSummary());
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load the dashboard. Please try again."
      );
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const cards = summary ? [
    {
      title: "Profile",
      value: `${summary.profileCompletion}%`,
      description: "Profile completion",
      icon: UserRound
    },
    {
      title: "Opportunities",
      value: summary.openOpportunities,
      description: "Open opportunities",
      icon: Sparkles
    },
    {
      title: "Applications",
      value: summary.applicationsTotal,
      description: `${summary.draftApplications} draft applications`,
      icon: ClipboardList
    }
  ] : [];

  return (
    <div className="space-y-6">
      <InstallBanner />

      {!summary && !error ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-600">
          <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
          Loading dashboard
        </div>
      ) : null}

      {error ? (
        <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-600" size={28} />
          <h1 className="mt-3 text-lg font-semibold text-ink">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Button className="mt-5" onClick={loadDashboard} variant="secondary">
            <RefreshCw className="mr-2" size={18} />
            Try again
          </Button>
        </section>
      ) : null}

      {summary ? (
        <>
      <section className="rounded-lg bg-brand-700 px-5 py-6 text-white shadow-soft">
        <p className="text-sm font-medium text-brand-100">Welcome back</p>
        <h1 className="mt-2 text-2xl font-semibold">Youth dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-50">
          Track your profile, opportunities, and applications in one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              key={card.title}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon size={20} />
              </div>
              <p className="text-2xl font-semibold text-ink">{card.value}</p>
              <h2 className="mt-1 text-base font-semibold text-ink">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
            </article>
          );
        })}
      </section>
        </>
      ) : null}
    </div>
  );
}
