export type YouthForumSummaryStats = {
  totalForums: number;
  activeForums: number;
  forumTypes: number;
  totalMembers: number;
};

export type YouthForumSummary = {
  id: string;
  name: string;
  forumType: string;
  status: string;
  membersCount: number;
  joinedAt?: string;
};

export type YouthForumsResponse = {
  summary: YouthForumSummaryStats;
  forums: YouthForumSummary[];
};

export type YouthForumMember = {
  name: string;
  role?: string;
};

export type YouthForumEvent = {
  id: string;
  title: string;
  description?: string;
  eventDate?: string;
  location?: string;
  accessLevel?: string;
  theme?: string;
};

export type YouthForumDiscussion = {
  id: string;
  title?: string;
  content?: string;
  author?: string;
  createdAt?: string;
};

export type YouthForumDetail = YouthForumSummary & {
  description?: string;
  location?: string;
  membershipRole?: string;
  members: YouthForumMember[];
  events: YouthForumEvent[];
  discussions: YouthForumDiscussion[];
};
