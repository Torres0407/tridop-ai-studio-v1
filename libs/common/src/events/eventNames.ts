// ─── libs/common/src/events/eventNames.ts ───────────────────────────────────
// Single source of truth for ALL BullMQ queue / event names.
// No service should ever hardcode a queue-name string inline.
// §2 of TridopAI-Microservices-Architecture.md

export const EVENT_NAMES = {
  // identity-service → billing-service, engagement-service
  USER_CREATED: 'user.created',

  // billing-service → ai-service, sites-service
  SUBSCRIPTION_UPGRADED: 'subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription.downgraded',

  // sites-service → analytics-service, ai-service
  SITE_BLOCKS_UPDATED: 'site.blocks.updated',

  // deploy-service → engagement-service, domains-service, billing-service
  DEPLOY_COMPLETED: 'deploy.completed',
  DEPLOY_FAILED: 'deploy.failed',

  // domains-service → deploy-service
  DOMAIN_REGISTERED: 'domain.registered',
  DOMAIN_CONNECTED: 'domain.connected',

  // commerce-service → engagement-service
  BOOKING_CREATED: 'booking.created',

  // ai-service / any service → owner-service
  CONTENT_FLAGGED: 'content.flagged',

  // billing-service → domains-service, engagement-service
  SUBSCRIPTION_LAPSED: 'subscription.lapsed',

  // site-router (HTTP callback) → owner-service, engagement-service
  SITE_TRAFFIC_CAP_EXCEEDED: 'site.traffic.capExceeded',

  // billing-service internal (post-idempotency-check) — §11
  WEBHOOK_PROCESSED: 'webhook.processed',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
