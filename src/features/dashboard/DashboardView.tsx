"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Loader2,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Users,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { applicationsService } from "@/features/applications/service";
import {
  applicationStatusBadgeClass,
  formatApplicationDate
} from "@/features/applications/formatters";
import { InstallBanner } from "@/features/pwa/InstallBanner";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import type { DashboardSummary, YouthApplicationSummary } from "@/types/youth";
import { dashboardService } from "./service";

export function DashboardView() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentApplications, setRecentApplications] = useState<YouthApplicationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);
    setApplicationsError(null);

    try {
      const [nextSummary, applications] = await Promise.all([
        dashboardService.getSummary(),
        applicationsService.list()
      ]);

      setSummary(nextSummary);
      setRecentApplications(applications.slice(0, 3));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load the dashboard. Please try again."
      );
    }
  }, []);

  const loadRecentApplications = useCallback(async () => {
    setApplicationsError(null);

    try {
      setRecentApplications((await applicationsService.list()).slice(0, 3));
    } catch (caughtError) {
      setApplicationsError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load recent applications."
      );
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const cards = summary ? [
    {
      title: t("nav.profile"),
      value: `${summary.profileCompletion}%`,
      description: t("dashboard.profileCompletion"),
      href: "/profile",
      icon: UserRound
    },
    {
      title: t("nav.opportunities"),
      value: summary.openOpportunities,
      description: t("dashboard.openOpportunities"),
      href: "/opportunities",
      icon: Sparkles
    },
    {
      title: t("nav.applications"),
      value: summary.applicationsTotal,
      description: t("dashboard.draftApplications", { count: summary.draftApplications }),
      href: "/applications",
      icon: ClipboardList
    },
    {
      title: t("nav.groups"),
      value: t("nav.groups"),
      description: t("dashboard.groupsDescription"),
      href: "/groups",
      icon: Users
    },
    {
      title: t("nav.forums"),
      value: t("nav.forums"),
      description: t("dashboard.forumsDescription"),
      href: "/forums",
      icon: MessageSquare
    }
  ] : [];
  const quickActions = [
    {
      title: t("dashboard.completeProfile"),
      description: t("dashboard.completeProfileHelp"),
      href: "/profile",
      icon: UserRound
    },
    {
      title: t("dashboard.browseOpportunities"),
      description: t("dashboard.browseOpportunitiesHelp"),
      href: "/opportunities",
      icon: Sparkles
    },
    {
      title: t("dashboard.trackApplications"),
      description: t("dashboard.trackApplicationsHelp"),
      href: "/applications",
      icon: ClipboardList
    },
    {
      title: t("nav.groups"),
      description: t("dashboard.groupsHelp"),
      href: "/groups",
      icon: Users
    },
    {
      title: t("nav.forums"),
      description: t("dashboard.forumsHelp"),
      href: "/forums",
      icon: MessageSquare
    }
  ];

  return (
    <div className="space-y-6">
      <InstallBanner />

      {!summary && !error ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-600">
          <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
          {t("dashboard.loading")}
        </div>
      ) : null}

      {error ? (
        <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-600" size={28} />
          <h1 className="mt-3 text-lg font-semibold text-ink">{t("dashboard.unavailable")}</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Button className="mt-5" onClick={loadDashboard} variant="secondary">
            <RefreshCw className="mr-2" size={18} />
            {t("common.tryAgain")}
          </Button>
        </section>
      ) : null}

      {summary ? (
        <>
          <section className="rounded-lg bg-brand-700 px-5 py-6 text-white shadow-soft">
            <p className="text-sm font-medium text-brand-100">{t("dashboard.welcome")}</p>
            <h1 className="mt-2 text-2xl font-semibold">{t("dashboard.title")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-50">
              {t("dashboard.subtitle")}
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                  href={card.href}
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
                </Link>
              );
            })}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">{t("dashboard.recentApplications")}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t("dashboard.recentApplicationsHelp")}
                </p>
              </div>
              <Link
                className="hidden text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex"
                href="/applications"
              >
                {t("common.viewAll")}
              </Link>
            </div>

            {recentApplications === null && !applicationsError ? (
              <div className="flex items-center justify-center py-8 text-sm text-slate-600">
                <Loader2 className="mr-2 animate-spin text-brand-700" size={18} />
                {t("dashboard.recentApplications")}
              </div>
            ) : null}

            {applicationsError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p>{applicationsError}</p>
                <Button
                  className="mt-3"
                  onClick={loadRecentApplications}
                  variant="secondary"
                >
                  <RefreshCw className="mr-2" size={18} />
                  {t("common.retry")}
                </Button>
              </div>
            ) : null}

            {recentApplications?.length === 0 ? (
              <div className="mt-4 rounded-md bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-600">
                  {t("dashboard.noApplications")}
                </p>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                  href="/opportunities"
                >
                  {t("dashboard.browseOpportunities")}
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </div>
            ) : null}

            {recentApplications && recentApplications.length > 0 ? (
              <div className="mt-4 space-y-3">
                {recentApplications.map((application) => (
                  <article
                    className="rounded-lg border border-slate-200 p-4"
                    key={application.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-ink">
                          {application.opportunityTitle}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {application.stakeholderName}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {t("dashboard.appliedSubmitted")}: {formatApplicationDate(application.appliedAt)}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${applicationStatusBadgeClass(application.statusCode)}`}
                      >
                        {application.statusLabel}
                      </span>
                    </div>
                    <Link
                      className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 sm:w-auto"
                      href={`/applications/${application.id}`}
                    >
                      {t("dashboard.viewApplication")}
                      <ArrowRight className="ml-2" size={18} />
                    </Link>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">{t("dashboard.quickActions")}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                    href={action.href}
                    key={action.title}
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{action.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        {action.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
