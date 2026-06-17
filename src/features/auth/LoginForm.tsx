"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { OfflineNotice } from "@/components/feedback/OfflineNotice";
import { Button } from "@/components/ui/Button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import type { YouthSessionState } from "@/types/auth";
import { authService } from "./service";

function sessionDestination(session: YouthSessionState) {
  return session.status === "authenticated"
    ? "/dashboard"
    : session.status === "blocked"
      ? "/registration-application"
      : "/login";
}

export function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    authService.getSession().then((session) => {
      if (session.status !== "unauthenticated") {
        router.replace(sessionDestination(session));
      }
    }).catch(() => undefined);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isOnline) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.login({ phoneNumber, password });
      router.replace(sessionDestination(result.session));
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : t("login.error")
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <OfflineNotice mode="inline" />

      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 shrink-0 text-brand-700" size={18} />
          <p>{error}</p>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t("login.phone")}
        </span>
        <input
          autoComplete="username"
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          inputMode="tel"
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder={t("login.phonePlaceholder")}
          required
          type="tel"
          value={phoneNumber}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t("login.password")}
        </span>
        <input
          autoComplete="current-password"
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("login.passwordPlaceholder")}
          required
          type="password"
          value={password}
        />
      </label>

      <Button className="w-full" disabled={isSubmitting || !isOnline} type="submit">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={18} />
            {t("common.checking")}
          </>
        ) : (
          t("login.signIn")
        )}
      </Button>
    </form>
  );
}
