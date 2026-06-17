"use client";

import { LockKeyhole } from "lucide-react";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { LoginForm } from "./LoginForm";

export function LoginPageContent() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <LockKeyhole size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-ink">{t("login.title")}</h1>
              <p className="text-sm text-slate-500">{t("app.name")}</p>
            </div>
          </div>
          <LanguageSelector />
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
