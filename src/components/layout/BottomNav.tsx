"use client";

import Link from "next/link";
import { BriefcaseBusiness, ClipboardList, Home, UserRound } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const navItems = [
  { href: "/dashboard", labelKey: "nav.home", icon: Home },
  { href: "/opportunities", labelKey: "nav.opportunities", icon: BriefcaseBusiness },
  { href: "/applications", labelKey: "nav.applications", icon: ClipboardList },
  { href: "/profile", labelKey: "nav.profile", icon: UserRound }
] as const;

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="flex min-h-16 flex-col items-center justify-center gap-1 px-2 text-xs font-medium text-slate-600"
              href={item.href}
              key={item.href}
            >
              <Icon size={20} />
              <span className="max-w-full truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
