"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  FilePenLine,
  Loader2,
  MapPin,
  RefreshCw,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import { applicationsService } from "@/features/applications/service";
import type {
  OpportunityApplicationState,
  OpportunitySummary
} from "@/types/youth";
import {
  formatOpportunityDate,
  formatStatus,
  formatStipend,
  opportunityStatusBadgeClass
} from "./formatters";
import { opportunitiesService } from "./service";

type OpportunityDetailProps = {
  id: string;
};

export function OpportunityDetail({ id }: OpportunityDetailProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [opportunity, setOpportunity] = useState<OpportunitySummary | null>(null);
  const [applicationState, setApplicationState] =
    useState<OpportunityApplicationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isStartingApplication, setIsStartingApplication] = useState(false);

  const loadOpportunity = useCallback(async () => {
    setError(null);
    setNotice(null);

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

  function isApplicationWindowOpen(nextOpportunity: OpportunitySummary) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const opensAt = nextOpportunity.opensAt
      ? new Date(`${nextOpportunity.opensAt}T00:00:00`)
      : null;
    const closesAt = nextOpportunity.closesAt
      ? new Date(`${nextOpportunity.closesAt}T23:59:59`)
      : null;

    return (
      nextOpportunity.statusCode.toLowerCase() === "published" &&
      (!opensAt || today >= opensAt) &&
      (!closesAt || today <= closesAt)
    );
  }

  async function startApplication() {
    if (!opportunity || !applicationState || applicationState.hasApplied) {
      return;
    }

    setIsStartingApplication(true);
    setError(null);
    setNotice(null);

    try {
      const application = await applicationsService.createDraft({
        opportunityId: opportunity.id,
        coverNote: "",
        portfolioUrl: "",
        notes: ""
      });
      setNotice("Draft application created. Opening the editor...");
      router.push(`/applications/${application.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to start this application. Please try again."
      );
      await loadOpportunity().catch(() => undefined);
    } finally {
      setIsStartingApplication(false);
    }
  }

  useEffect(() => {
    loadOpportunity();
  }, [loadOpportunity]);

  if ((!opportunity || !applicationState) && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        {t("opportunities.loadingDetail")}
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("opportunities.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadOpportunity} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          {t("common.tryAgain")}
        </Button>
      </section>
    );
  }

  if (!opportunity || !applicationState) {
    return null;
  }

  const isOpenForApplications = isApplicationWindowOpen(opportunity);

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        href="/opportunities"
      >
        <ArrowLeft className="mr-2" size={18} />
        {t("opportunities.backToOpportunities")}
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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

      {notice ? (
        <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          <p>{notice}</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {applicationState.hasApplied ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-brand-700" size={22} />
            <div>
              <h2 className="font-semibold text-ink">
                {applicationState.canEdit ? "Draft application started" : "Application submitted"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("common.status")}: {formatStatus(applicationState.status)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Application ID: {applicationState.applicationId ?? "Not available"}
              </p>
              {applicationState.applicationId ? (
                <Link
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 sm:w-auto"
                  href={`/applications/${applicationState.applicationId}`}
                >
                  <FilePenLine className="mr-2" size={18} />
                  {applicationState.canEdit ? t("opportunities.continueDraft") : t("applications.viewApplication")}
                </Link>
              ) : null}
            </div>
          </div>
        ) : !isOpenForApplications ? (
          <div>
            <h2 className="font-semibold text-ink">{t("applications.unavailable")}</h2>
            <p className="mt-1 text-sm text-slate-600">
              This opportunity is not currently open for applications. Check the opening and closing dates above.
            </p>
            <Button className="mt-4 w-full sm:w-auto" disabled variant="secondary">
              {t("opportunities.applyUnavailable")}
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="font-semibold text-ink">{t("opportunities.readyToApply")}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Start a draft application now. You can edit and submit it from the application page.
            </p>
            <Button
              className="mt-4 w-full sm:w-auto"
              disabled={isStartingApplication}
              onClick={startApplication}
            >
              {isStartingApplication ? (
                <Loader2 className="mr-2 animate-spin" size={18} />
              ) : (
                <Send className="mr-2" size={18} />
              )}
              {t("opportunities.startApplication")}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
