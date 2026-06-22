"use client";

import { useTranslation } from "@/hooks/useTranslation";

export function OfflinePageContent() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <h1 className="text-xl font-semibold text-ink">{t("offline.title")}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t("offline.help")}</p>
      </section>
    </main>
  );
}
