"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type OfflineNoticeProps = {
  mode?: "banner" | "inline";
};

export function OfflineNotice({ mode = "banner" }: OfflineNoticeProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  const message =
    "You are offline. Previously viewed pages may remain visible, but submissions are paused until you reconnect.";

  if (mode === "inline") {
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <WifiOff className="mt-0.5 shrink-0" size={18} />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <WifiOff size={18} />
        <p>{message}</p>
      </div>
    </div>
  );
}
