// ─── libs/types/src/ai.types.ts ─────────────────────────────────────────────

export type QuotaTier = 'starter' | 'pro' | 'business';
export type AIModel = 'pro' | 'flash';

export interface PromptHistory {
  id: string;
  userId: string;
  siteId?: string;
  model: AIModel;
  promptTokens: number;
  completionTokens: number;
  cached: boolean;
  createdAt: Date;
}

export interface GenerationRequest {
  userId: string;
  siteId?: string;
  prompt: string;
  model?: AIModel;
  stream?: boolean;
  contextOverride?: Record<string, unknown>;
}

export interface QuotaStatus {
  userId: string;
  tier: QuotaTier;
  used: number;
  limit: number;
  resetsAt: Date;
}
