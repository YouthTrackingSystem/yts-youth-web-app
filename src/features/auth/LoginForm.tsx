"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { OfflineNotice } from "@/components/feedback/OfflineNotice";
import { Button } from "@/components/ui/Button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { authService } from "./service";

type LoginFormState = "idle" | "submitting" | "pending-api";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginFormState>("idle");
  const isOnline = useOnlineStatus();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isOnline) {
      return;
    }

    setState("submitting");

    try {
      await authService.login({ identifier, password });
    } catch {
      setState("pending-api");
    }
  }

  const isSubmitting = state === "submitting";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <OfflineNotice mode="inline" />

      {state === "pending-api" ? (
        <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <AlertCircle className="mt-0.5 shrink-0 text-brand-700" size={18} />
          <p>
            Login UI is ready. The Laravel youth auth API endpoint is still
            pending for Phase 2B.
          </p>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Phone number or email
        </span>
        <input
          autoComplete="username"
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="Enter your YTS login"
          required
          type="text"
          value={identifier}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </span>
        <input
          autoComplete="current-password"
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          type="password"
          value={password}
        />
      </label>

      <Button className="w-full" disabled={isSubmitting || !isOnline} type="submit">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={18} />
            Checking
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
