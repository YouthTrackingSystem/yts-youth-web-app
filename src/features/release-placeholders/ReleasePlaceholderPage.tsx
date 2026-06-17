"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/i18n/translations";

type ReleasePlaceholderPageProps = {
  titleKey: TranslationKey;
  messageKey: TranslationKey;
  icon: "groups" | "forums";
};

export function ReleasePlaceholderPage({
  titleKey,
  messageKey,
  icon
}: ReleasePlaceholderPageProps) {
  const { t } = useTranslation();
  const title = t(titleKey);
  const message = t(messageKey);
  const Icon = icon === "groups" ? Users : MessageSquare;

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-brand-700 px-5 py-6 text-white shadow-soft">
        <p className="text-sm font-medium text-brand-100">Youth portal</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-50">
          {message}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          {message}
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
          href="/dashboard"
        >
          <ArrowLeft className="mr-2" size={18} />
          {t("common.backToDashboard")}
        </Link>
      </section>
    </div>
  );
}
