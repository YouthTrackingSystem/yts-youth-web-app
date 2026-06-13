import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline"
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <h1 className="text-xl font-semibold text-ink">You are offline</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Reconnect to continue using the YTS Youth Portal.
        </p>
      </section>
    </main>
  );
}
