"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import { translateStatus } from "@/lib/i18n/status";
import type { YouthApplicationSummary } from "@/types/youth";
import {
  applicationStatusBadgeClass,
  formatApplicationDate
} from "./formatters";
import { applicationsService } from "./service";

export function ApplicationsList() {
  const { language, t } = useTranslation();
  const [applications, setApplications] =
    useState<YouthApplicationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setError(null);

    try {
      setApplications(await applicationsService.list());
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : t("applications.unavailable")
      );
    }
  }, [t]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  if (!applications && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        {t("applications.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("applications.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadApplications} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          {t("common.tryAgain")}
        </Button>
      </section>
    );
  }

  if (!applications?.length) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <ClipboardList className="mx-auto text-brand-700" size={30} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("applications.emptyTitle")}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("applications.emptyHelp")}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">{t("applications.title")}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {t("applications.subtitle")}
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        {applications.map((application) => (
          <article
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={application.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {application.opportunityTitle}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {application.stakeholderName}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${applicationStatusBadgeClass(application.statusCode)}`}
              >
                {translateStatus(application.statusCode || application.statusLabel, t)}
              </span>
            </div>

            <div className="mt-4 rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("applications.coverNote")}
              </p>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-700">
                {application.coverNote ?? t("applications.noCoverNote")}
              </p>
            </div>

            <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex gap-2">
                <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={17} />
                <div>
                  <dt className="font-medium text-ink">{t("applications.applied")}</dt>
                  <dd>{formatApplicationDate(application.appliedAt, language, t("common.notAvailable"))}</dd>
                </div>
              </div>
              <div className="flex gap-2">
                <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={17} />
                <div>
                  <dt className="font-medium text-ink">{t("applications.decision")}</dt>
                  <dd>{formatApplicationDate(application.decisionAt, language, t("common.notAvailable"))}</dd>
                </div>
              </div>
            </dl>

            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
              href={`/applications/${application.id}`}
            >
              {application.isDraft ? t("applications.editDraftAction") : t("applications.viewApplication")}
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
