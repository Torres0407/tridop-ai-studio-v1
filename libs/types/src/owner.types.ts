// ─── libs/types/src/owner.types.ts ──────────────────────────────────────────

export interface OwnerActionLog {
  id: string;
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface PlatformSettings {
  id: string;
  key: string;
  value: unknown;
  updatedAt: Date;
}

export interface FlaggedContent {
  id: string;
  siteId?: string;
  userId?: string;
  contentType: string;
  reason: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  rolloutPercent?: number;
  targetUserIds?: string[];
  updatedAt: Date;
}
