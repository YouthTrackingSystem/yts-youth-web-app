"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Loader2,
  PiggyBank,
  RefreshCw,
  UserRound,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import { translateStatus } from "@/lib/i18n/status";
import type { YouthGroupsResponse } from "@/types/groups";
import { formatGroupDate, groupStatusBadgeClass } from "./formatters";
import { groupsService } from "./service";

export function GroupsList() {
  const { language, t } = useTranslation();
  const [data, setData] = useState<YouthGroupsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setError(null);

    try {
      setData(await groupsService.list());
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : t("groups.unavailable")
      );
    }
  }, [t]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        {t("groups.loading")}
      </div>
    );
  }

  if (!data && error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("groups.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadGroups} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          {t("common.retry")}
        </Button>
      </section>
    );
  }

  if (!data) return null;

  const summaryCards = [
    { label: t("groups.totalGroups"), value: data.summary.totalGroups, icon: Users },
    { label: t("groups.activeGroups"), value: data.summary.activeGroups, icon: Activity },
    { label: t("groups.totalMembers"), value: data.summary.totalMembers, icon: UserRound },
    { label: t("groups.savingsGroups"), value: data.summary.savingsGroups, icon: PiggyBank }
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">{t("groups.title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("groups.subtitle")}</p>
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

      {data.groups.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Users className="mx-auto text-brand-700" size={30} />
          <h2 className="mt-3 text-lg font-semibold text-ink">{t("groups.empty")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("groups.emptyHelp")}</p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {data.groups.map((group) => (
            <article
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={group.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{group.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{group.groupType}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${groupStatusBadgeClass(group.status)}`}>
                  {translateStatus(group.status, t)}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-500">{t("groups.members")}</dt>
                  <dd className="mt-1 font-semibold text-ink">{group.membersCount}</dd>
                </div>
                {group.joinedAt ? (
                  <div>
                    <dt className="font-medium text-slate-500">{t("groups.joined")}</dt>
                    <dd className="mt-1 text-ink">{formatGroupDate(group.joinedAt, language)}</dd>
                  </div>
                ) : null}
              </dl>

              <Link
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
                href={`/groups/${group.id}`}
              >
                {t("groups.viewDetails")}
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
