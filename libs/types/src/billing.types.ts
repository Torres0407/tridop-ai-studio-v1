// ─── libs/types/src/billing.types.ts ────────────────────────────────────────

export type PlanTier = 'free' | 'starter' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'lapsed';
export type PaymentProvider = 'paystack';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  priceMonthlyUsd: number;
  priceAnnualUsd: number;
  features: Record<string, unknown>;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  providerSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  amountCents: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded';
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  rewardGranted: boolean;
  createdAt: Date;
}

export interface Agency {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Date;
}

export interface AgencyClient {
  id: string;
  agencyId: string;
  clientUserId: string;
  addedAt: Date;
}
