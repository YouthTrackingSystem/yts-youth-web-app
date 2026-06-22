import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  YouthForumDetail,
  YouthForumDiscussion,
  YouthForumEvent,
  YouthForumMember,
  YouthForumSummary,
  YouthForumsResponse
} from "@/types/forums";

export type ForumsService = {
  list: () => Promise<YouthForumsResponse>;
  getById: (id: string) => Promise<YouthForumDetail>;
};

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value !== null && typeof value === "object" ? (value as ApiRecord) : {};
}

function readString(record: ApiRecord, key: string) {
  const value = record[key];

  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);

  return undefined;
}

function readNumber(record: ApiRecord, key: string) {
  const value = record[key];
  const number = typeof value === "number" ? value : Number(value);

  return Number.isFinite(number) ? number : 0;
}

function normalizeForum(value: unknown): YouthForumSummary {
  const forum = asRecord(value);

  return {
    id: readString(forum, "id") ?? "",
    name: readString(forum, "name") ?? "-",
    forumType: readString(forum, "forum_type") ?? readString(forum, "type") ?? "-",
    status: readString(forum, "status") ?? "-",
    membersCount: readNumber(forum, "members_count"),
    joinedAt: readString(forum, "joined_at")
  };
}

function normalizeMember(value: unknown): YouthForumMember {
  const member = asRecord(value);

  return {
    name: readString(member, "name") ?? "-",
    role: readString(member, "role")
  };
}

function normalizeEvent(value: unknown): YouthForumEvent {
  const event = asRecord(value);

  return {
    id: readString(event, "id") ?? "",
    title: readString(event, "title") ?? "-",
    description: readString(event, "description"),
    eventDate: readString(event, "event_date"),
    location: readString(event, "location"),
    accessLevel: readString(event, "access_level"),
    theme: readString(event, "theme")
  };
}

function normalizeDiscussion(value: unknown, index: number): YouthForumDiscussion {
  const discussion = asRecord(value);

  return {
    id: readString(discussion, "id") ?? String(index),
    title: readString(discussion, "title") ?? readString(discussion, "subject"),
    content:
      readString(discussion, "content") ??
      readString(discussion, "body") ??
      readString(discussion, "description"),
    author:
      readString(discussion, "author") ??
      readString(asRecord(discussion.created_by), "name"),
    createdAt: readString(discussion, "created_at")
  };
}

export const forumsService: ForumsService = {
  async list() {
    const response = await apiClient.request<unknown>(apiEndpoints.youth.forums, {
      cache: "no-store"
    });
    const payload = asRecord(response);
    const summary = asRecord(payload.summary);
    const forums = Array.isArray(payload.forums) ? payload.forums : [];

    return {
      summary: {
        totalForums: readNumber(summary, "total_forums"),
        activeForums: readNumber(summary, "active_forums"),
        forumTypes: readNumber(summary, "forum_types"),
        totalMembers: readNumber(summary, "total_members")
      },
      forums: forums.map(normalizeForum).filter(({ id }) => id)
    };
  },

  async getById(id) {
    const response = await apiClient.request<unknown>(apiEndpoints.youth.forum(id), {
      cache: "no-store"
    });
    const payload = asRecord(response);
    const forum = asRecord(payload.forum);
    const membership = asRecord(payload.membership);
    const membersPayload = asRecord(payload.members);
    const members = Array.isArray(membersPayload.items) ? membersPayload.items : [];
    const events = Array.isArray(payload.events) ? payload.events : [];
    const discussions = Array.isArray(payload.discussions)
      ? payload.discussions
      : Array.isArray(payload.discussion)
        ? payload.discussion
        : [];
    const summary = normalizeForum({
      ...forum,
      members_count: membersPayload.total_members,
      joined_at: membership.joined_at
    });

    return {
      ...summary,
      description: readString(forum, "description"),
      location: readString(forum, "location"),
      membershipRole: readString(membership, "role"),
      members: members.map(normalizeMember),
      events: events.map(normalizeEvent),
      discussions: discussions.map(normalizeDiscussion)
    };
  }
};
