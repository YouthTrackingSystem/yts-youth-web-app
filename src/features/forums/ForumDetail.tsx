"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import { translateStatus } from "@/lib/i18n/status";
import type { YouthForumDetail } from "@/types/forums";
import { formatForumDate, forumStatusBadgeClass } from "./formatters";
import { forumsService } from "./service";

type ForumDetailProps = {
  id: string;
};

export function ForumDetail({ id }: ForumDetailProps) {
  const { language, t } = useTranslation();
  const [forum, setForum] = useState<YouthForumDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadForum = useCallback(async () => {
    setError(null);

    try {
      setForum(await forumsService.getById(id));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : t("forums.unavailable")
      );
    }
  }, [id, t]);

  useEffect(() => {
    void loadForum();
  }, [loadForum]);

  if (!forum && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        {t("forums.loadingDetail")}
      </div>
    );
  }

  if (!forum && error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("forums.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadForum} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          {t("common.retry")}
        </Button>
      </section>
    );
  }

  if (!forum) return null;

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        href="/forums"
      >
        <ArrowLeft className="mr-2" size={18} />
        {t("forums.backToForums")}
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-brand-700" size={21} />
          <h2 className="text-lg font-semibold text-ink">{t("forums.information")}</h2>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">{forum.forumType}</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{forum.name}</h1>
            {forum.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                {forum.description}
              </p>
            ) : null}
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${forumStatusBadgeClass(forum.status)}`}>
            {translateStatus(forum.status, t)}
          </span>
        </div>
        {forum.location ? (
          <div className="mt-4 flex gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 shrink-0 text-brand-700" size={18} />
            <span>{forum.location}</span>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand-700" size={20} />
          <h2 className="text-lg font-semibold text-ink">{t("forums.membership")}</h2>
        </div>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">{t("forums.role")}</dt>
            <dd className="mt-1 text-ink">{forum.membershipRole ?? t("forums.notAvailable")}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">{t("forums.joined")}</dt>
            <dd className="mt-1 text-ink">{formatForumDate(forum.joinedAt, language)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="text-brand-700" size={20} />
          <h2 className="text-lg font-semibold text-ink">{t("forums.members")}</h2>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {forum.membersCount}
          </span>
        </div>
        {forum.members.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {forum.members.map((member, index) => (
              <article className="rounded-md bg-slate-50 p-3" key={`${member.name}-${index}`}>
                <p className="font-medium text-ink">{member.name}</p>
                {member.role ? <p className="mt-1 text-sm text-slate-600">{member.role}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message={t("common.empty")} />
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-brand-700" size={20} />
          <h2 className="text-lg font-semibold text-ink">{t("forums.upcomingEvents")}</h2>
        </div>
        {forum.events.length ? (
          <div className="mt-4 space-y-3">
            {forum.events.map((event) => (
              <article className="rounded-lg border border-slate-200 p-4" key={event.id}>
                <h3 className="font-semibold text-ink">{event.title}</h3>
                {event.description ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{event.description}</p>
                ) : null}
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <DetailValue label={t("forums.eventDate")} value={formatForumDate(event.eventDate, language)} />
                  {event.location ? <DetailValue label={t("forums.location")} value={event.location} /> : null}
                  {event.theme ? <DetailValue label={t("forums.theme")} value={event.theme} /> : null}
                  {event.accessLevel ? <DetailValue label={t("forums.accessLevel")} value={event.accessLevel} /> : null}
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message={t("forums.noEvents")} />
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-brand-700" size={20} />
          <h2 className="text-lg font-semibold text-ink">{t("forums.recentDiscussions")}</h2>
        </div>
        {forum.discussions.length ? (
          <div className="mt-4 space-y-3">
            {forum.discussions.map((discussion) => (
              <article className="rounded-lg border border-slate-200 p-4" key={discussion.id}>
                {discussion.title ? <h3 className="font-semibold text-ink">{discussion.title}</h3> : null}
                {discussion.content ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{discussion.content}</p> : null}
                {discussion.author || discussion.createdAt ? (
                  <p className="mt-3 text-xs text-slate-500">
                    {[discussion.author, formatForumDate(discussion.createdAt, language)].filter((value) => value && value !== "-").join(" - ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message={t("forums.noDiscussions")} />
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600">{message}</p>;
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
