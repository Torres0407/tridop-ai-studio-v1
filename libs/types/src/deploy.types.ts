// ─── libs/types/src/deploy.types.ts ─────────────────────────────────────────

export type BuildStatus = 'queued' | 'building' | 'success' | 'failed';

export interface LiveSite {
  id: string;
  siteId: string;
  userId: string;
  /** Computed at build time: true if any domain row has type 'registered' | 'connected' */
  hasCustomDomain: boolean;
  deployedUrl: string;
  r2Key: string;
  buildStatus: BuildStatus;
  builtAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildJob {
  id: string;
  siteId: string;
  userId: string;
  status: BuildStatus;
  logs: string[];
  startedAt?: Date;
  completedAt?: Date;
}
