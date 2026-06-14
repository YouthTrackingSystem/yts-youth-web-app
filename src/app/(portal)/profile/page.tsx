import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile"
};

export default function ProfilePage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-xl font-semibold text-ink">My profile</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Profile viewing, permitted updates, avatar upload, and offline cached
        viewing will connect after the Laravel youth profile API is available.
      </p>
    </section>
  );
}
