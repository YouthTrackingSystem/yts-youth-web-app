"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Layers3,
  Loader2,
  MessageSquare,
  RefreshCw,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import type { YouthForumsResponse } from "@/types/forums";
import { formatForumDate, forumStatusBadgeClass } from "./formatters";
import { forumsService } from "./service";

export function ForumsList() {
  const { language, t } = useTranslation();
  const [data, setData] = useState<YouthForumsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadForums = useCallback(async () => {
    setError(null);

    try {
      setData(await forumsService.list());
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : t("forums.unavailable")
      );
    }
  }, [t]);

  useEffect(() => {
    void loadForums();
  }, [loadForums]);

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        {t("forums.loading")}
      </div>
    );
  }

  if (!data && error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("forums.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadForums} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          {t("common.retry")}
        </Button>
      </section>
    );
  }

  if (!data) return null;

  const summaryCards = [
    { label: t("forums.totalForums"), value: data.summary.totalForums, icon: MessageSquare },
    { label: t("forums.activeForums"), value: data.summary.activeForums, icon: Activity },
    { label: t("forums.forumTypes"), value: data.summary.forumTypes, icon: Layers3 },
    { label: t("forums.totalMembers"), value: data.summary.totalMembers, icon: Users }
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">{t("forums.title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("forums.subtitle")}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={label}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <Icon size={18} />
            </span>
            <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
          </article>
        ))}
      </section>

      {data.forums.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <MessageSquare className="mx-auto text-brand-700" size={30} />
          <h2 className="mt-3 text-lg font-semibold text-ink">{t("forums.empty")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("forums.emptyHelp")}</p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {data.forums.map((forum) => (
            <article
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={forum.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{forum.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{forum.forumType}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${forumStatusBadgeClass(forum.status)}`}>
                  {forum.status}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-500">{t("forums.members")}</dt>
                  <dd className="mt-1 font-semibold text-ink">{forum.membersCount}</dd>
                </div>
                {forum.joinedAt ? (
                  <div>
                    <dt className="font-medium text-slate-500">{t("forums.joined")}</dt>
                    <dd className="mt-1 text-ink">{formatForumDate(forum.joinedAt, language)}</dd>
                  </div>
                ) : null}
              </dl>

              <Link
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                href={`/forums/${forum.id}`}
              >
                {t("forums.viewDetails")}
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
