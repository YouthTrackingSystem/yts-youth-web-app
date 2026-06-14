"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import type {
  OpportunityApplicationState,
  OpportunitySummary
} from "@/types/youth";
import {
  formatOpportunityDate,
  formatStatus,
  formatStipend
} from "./formatters";
import { opportunitiesService } from "./service";

type OpportunityDetailProps = {
  id: string;
};

export function OpportunityDetail({ id }: OpportunityDetailProps) {
  const [opportunity, setOpportunity] = useState<OpportunitySummary | null>(null);
  const [applicationState, setApplicationState] =
    useState<OpportunityApplicationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOpportunity = useCallback(async () => {
    setError(null);

    try {
      const [nextOpportunity, nextApplicationState] = await Promise.all([
        opportunitiesService.getById(id),
        opportunitiesService.getApplicationState(id)
      ]);
      setOpportunity(nextOpportunity);
      setApplicationState(nextApplicationState);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load this opportunity. Please try again."
      );
    }
  }, [id]);

  useEffect(() => {
    loadOpportunity();
  }, [loadOpportunity]);

  if ((!opportunity || !applicationState) && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        Loading opportunity
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">Opportunity unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadOpportunity} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          Try again
        </Button>
      </section>
    );
  }

  if (!opportunity || !applicationState) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        href="/opportunities"
      >
        <ArrowLeft className="mr-2" size={18} />
        Back to opportunities
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
            {opportunity.typeLabel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {opportunity.sectorName}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold text-ink">{opportunity.title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          {opportunity.stakeholderName}
        </p>

        {opportunity.description ? (
          <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-700">
            {opportunity.description}
          </p>
        ) : null}

        <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">Location</dt>
              <dd className="mt-1 text-slate-600">{opportunity.location}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Banknote className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">Stipend</dt>
              <dd className="mt-1 text-slate-600">
                {formatStipend(opportunity.stipendAmount)}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">Application dates</dt>
              <dd className="mt-1 text-slate-600">
                {formatOpportunityDate(opportunity.opensAt)} to{" "}
                {formatOpportunityDate(opportunity.closesAt)}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">Opportunity dates</dt>
              <dd className="mt-1 text-slate-600">
                {formatOpportunityDate(opportunity.startsAt)} to{" "}
                {formatOpportunityDate(opportunity.endsAt)}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {applicationState.hasApplied ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-brand-700" size={22} />
            <div>
              <h2 className="font-semibold text-ink">Application submitted</h2>
              <p className="mt-1 text-sm text-slate-600">
                Status: {formatStatus(applicationState.status)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Application ID: {applicationState.applicationId ?? "Not available"}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-semibold text-ink">Ready to apply?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Application submission will be available in a later phase.
            </p>
            <Button className="mt-4 w-full sm:w-auto" disabled>
              Apply
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
