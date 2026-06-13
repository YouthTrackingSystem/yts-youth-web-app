import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-8 flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <LockKeyhole size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Youth login</h1>
            <p className="text-sm text-slate-500">YTS Youth Portal</p>
          </div>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
