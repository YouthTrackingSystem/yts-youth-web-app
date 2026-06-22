"use client";

import Link from "next/link";
import { Bell, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/service";
import { useTranslation } from "@/hooks/useTranslation";
import type { YouthSessionState } from "@/types/auth";
import { LanguageSelector } from "./LanguageSelector";

type AppHeaderProps = {
  session: YouthSessionState;
};

export function AppHeader({ session }: AppHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const name = session.status === "authenticated" ? session.user.name : t("common.youth");

  async function handleLogout() {
    setIsLoggingOut(true);
    await authService.logout().catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex flex-col">
          <span className="text-sm font-semibold text-brand-700">YTS</span>
          <span className="text-xs text-slate-500">{t("app.shortName")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button
            aria-label={t("header.notifications")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            type="button"
          >
            <Bell size={20} />
          </button>
          <button
            aria-label={t("header.profileFor", { name })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700"
            type="button"
            title={name}
          >
            <UserRound size={20} />
          </button>
          <button
            aria-label={t("common.signOut")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
