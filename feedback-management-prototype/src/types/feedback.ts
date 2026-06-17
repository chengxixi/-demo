export type FeedbackStatus = 'pending' | 'processing' | 'resolved';

export type FeedbackStatusFilter = FeedbackStatus | 'all';

export type FeedbackPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface FeedbackItem {
  id: string;
  title: string;
  source: string;
  owner: string;
  createdAt: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  summary: string;
  tags: string[];
}
