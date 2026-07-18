// ─── libs/types/src/domain.types.ts ─────────────────────────────────────────
// DomainType is referenced by deploy-service's hasCustomDomain computation (§9)

export type DomainType = 'subdomain' | 'registered' | 'connected' | 'suspended';

export interface Domain {
  id: string;
  siteId: string;
  userId: string;
  domain: string;
  type: DomainType;
  sslStatus?: string;
  gracePeriodEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
