// ─── libs/types/src/engagement.types.ts ─────────────────────────────────────

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ReviewsCache {
  id: string;
  siteId: string;
  source: 'google' | 'facebook';
  rating: number;
  reviewText: string;
  reviewerName: string;
  reviewedAt: Date;
  syncedAt: Date;
}
