"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import { translateStatus } from "@/lib/i18n/status";
import type { YouthGroupDetail } from "@/types/groups";
import {
  formatGroupDate,
  formatGroupNumber,
  groupStatusBadgeClass
} from "./formatters";
import { groupsService } from "./service";

type GroupDetailProps = {
  id: string;
};

export function GroupDetail({ id }: GroupDetailProps) {
  const { language, t } = useTranslation();
  const [group, setGroup] = useState<YouthGroupDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = useCallback(async () => {
    setError(null);

    try {
      setGroup(await groupsService.getById(id));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : t("groups.unavailable")
      );
    }
  }, [id, t]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  if (!group && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        {t("groups.loadingDetail")}
      </div>
    );
  }

  if (!group && error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("groups.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadGroup} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          {t("common.retry")}
        </Button>
      </section>
    );
  }

  if (!group) return null;

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        href="/groups"
      >
        <ArrowLeft className="mr-2" size={18} />
        {t("groups.backToGroups")}
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">{group.groupType}</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{group.name}</h1>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${groupStatusBadgeClass(group.status)}`}>
            {translateStatus(group.status, t)}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">{t("groups.location")}</dt>
              <dd className="mt-1 text-slate-600">
                {[group.physicalAddress, group.location].filter(Boolean).join(" - ") || t("groups.notAvailable")}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Users className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">{t("groups.memberCount")}</dt>
              <dd className="mt-1 text-slate-600">{group.membersCount}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">{t("groups.membership")}</dt>
              <dd className="mt-1 text-slate-600">
                {t("groups.role")}: {group.membershipRole ?? t("groups.notAvailable")}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">{t("groups.joined")}</dt>
              <dd className="mt-1 text-slate-600">{formatGroupDate(group.joinedAt, language)}</dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {group.shares ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-brand-700" size={20} />
              <h2 className="text-lg font-semibold text-ink">{t("groups.shares")}</h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <SummaryValue label={t("groups.purchasedShares")} value={formatGroupNumber(group.shares.purchasedShares, language)} />
              <SummaryValue label={t("groups.soldShares")} value={formatGroupNumber(group.shares.soldShares, language)} />
              <SummaryValue label={t("groups.netShares")} value={formatGroupNumber(group.shares.netShares, language)} />
              <SummaryValue label={t("groups.netAmount")} value={formatGroupNumber(group.shares.netAmount, language)} />
            </dl>
          </article>
        ) : null}

        {group.savings ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PiggyBank className="text-brand-700" size={20} />
              <h2 className="text-lg font-semibold text-ink">{t("groups.savings")}</h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <SummaryValue label={t("groups.deposits")} value={formatGroupNumber(group.savings.deposits, language)} />
              <SummaryValue label={t("groups.withdrawals")} value={formatGroupNumber(group.savings.withdrawals, language)} />
              <SummaryValue label={t("groups.balance")} value={formatGroupNumber(group.savings.balance, language)} />
            </dl>
          </article>
        ) : null}
      </section>
    </div>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value}</dd>
    </div>
  );
}
