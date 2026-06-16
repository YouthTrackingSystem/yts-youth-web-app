"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Loader2,
  MapPin,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import type { OpportunitySummary } from "@/types/youth";
import {
  formatOpportunityDate,
  formatStipend,
  opportunityStatusBadgeClass
} from "./formatters";
import { opportunitiesService } from "./service";

export function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<OpportunitySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOpportunities = useCallback(async () => {
    setError(null);

    try {
      setOpportunities(await opportunitiesService.list());
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load opportunities. Please try again."
      );
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  if (!opportunities && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        Loading opportunities
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">Opportunities unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadOpportunities} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          Try again
        </Button>
      </section>
    );
  }

  if (!opportunities?.length) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <BriefcaseBusiness className="mx-auto text-brand-700" size={30} />
        <h1 className="mt-3 text-lg font-semibold text-ink">No opportunities available</h1>
        <p className="mt-2 text-sm text-slate-600">
          New opportunities will appear here when they are published.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Opportunities</h1>
        <p className="mt-1 text-sm text-slate-600">
          Explore currently available youth opportunities.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        {opportunities.map((opportunity) => (
          <article
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={opportunity.id}
          >
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                {opportunity.typeLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {opportunity.sectorName}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${opportunityStatusBadgeClass(opportunity.statusCode)}`}
              >
                {opportunity.statusLabel}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-ink">{opportunity.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {opportunity.stakeholderName}
            </p>

            <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 shrink-0 text-brand-700" size={17} />
                <div>
                  <dt className="font-medium text-ink">Location</dt>
                  <dd>{opportunity.location}</dd>
                </div>
              </div>
              <div className="flex gap-2">
                <Banknote className="mt-0.5 shrink-0 text-brand-700" size={17} />
                <div>
                  <dt className="font-medium text-ink">Stipend</dt>
                  <dd>{formatStipend(opportunity.stipendAmount)}</dd>
                </div>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={17} />
                <div>
                  <dt className="font-medium text-ink">Applications</dt>
                  <dd>
                    {formatOpportunityDate(opportunity.opensAt)} to{" "}
                    {formatOpportunityDate(opportunity.closesAt)}
                  </dd>
                </div>
              </div>
            </dl>

            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
              href={`/opportunities/${opportunity.id}`}
            >
              View details
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
