import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications"
};

export default function ApplicationsPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-xl font-semibold text-ink">My applications</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Application history, draft editing, status tracking, and CV handling
        will connect after the Laravel youth applications API is available.
      </p>
    </section>
  );
}
