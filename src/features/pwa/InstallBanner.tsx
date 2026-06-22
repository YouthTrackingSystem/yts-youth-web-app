"use client";

import { CheckCircle2, Download, Loader2, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useTranslation } from "@/hooks/useTranslation";

export function InstallBanner() {
  const { t } = useTranslation();
  const {
    canInstall,
    dismiss,
    install,
    isDismissed,
    isInstalling,
    isIosSafari,
    isStandalone,
    showSuccess
  } = usePwaInstall();

  if (showSuccess) {
    return (
      <section
        aria-live="polite"
        className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 shadow-sm"
      >
        <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={22} />
        <div>
          <h2 className="font-semibold">{t("pwa.installedTitle")}</h2>
          <p className="mt-1 text-sm text-green-800">
            {t("pwa.installedHelp")}
          </p>
        </div>
      </section>
    );
  }

  if (isStandalone || isDismissed || (!canInstall && !isIosSafari)) {
    return null;
  }

  return (
    <section className="rounded-lg border border-brand-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Smartphone size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-ink">{t("pwa.installTitle")}</h2>
          {isIosSafari && !canInstall ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">
              <Share className="mr-1 inline-block align-text-bottom" size={17} />
              {t("pwa.iosHelpBefore")}
            </p>
          ) : (
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("pwa.installHelp")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
        <Button disabled={isInstalling} onClick={dismiss} variant="secondary">
          {t("pwa.notNow")}
        </Button>
        {canInstall ? (
          <Button disabled={isInstalling} onClick={install}>
            {isInstalling ? (
              <Loader2 className="mr-2 animate-spin" size={18} />
            ) : (
              <Download className="mr-2" size={18} />
            )}
            {t("pwa.install")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
