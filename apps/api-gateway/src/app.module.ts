import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { SharedExceptionFilter } from '@libs/common';
import {
  IDENTITY_CLIENT,
  IdentityClient,
  SITES_CLIENT,
  SitesClient,
  AI_CLIENT,
  AiClient,
  DEPLOY_CLIENT,
  DeployClient,
  DOMAINS_CLIENT,
  DomainsClient,
  COMMERCE_CLIENT,
  CommerceClient,
  BILLING_CLIENT,
  BillingClient,
  ENGAGEMENT_CLIENT,
  EngagementClient,
  ANALYTICS_CLIENT,
  AnalyticsClient,
  OWNER_CLIENT,
  OwnerClient,
} from '@libs/clients';

import { AuthenticateJWTMiddleware } from './middleware/authenticateJWT';
import { KillSwitchMiddleware } from './middleware/killSwitch.middleware';
import { AuthProxy, UsersProxy, CategoriesProxy } from './proxy/identity.proxy';
import { PromptStreamGateway } from './sse/promptStream.gateway';
import { DeployStreamGateway } from './sse/deployStream.gateway';
import { NotificationStreamGateway } from './sse/notificationStream.gateway';

// Stub proxies — fleshed out as each service is built
import { SitesProxy } from './proxy/sites.proxy';
import { AiProxy } from './proxy/ai.proxy';
import { DeployProxy } from './proxy/deploy.proxy';
import { DomainsProxy } from './proxy/domains.proxy';
import { CommerceProxy } from './proxy/commerce.proxy';
import { BillingProxy } from './proxy/billing.proxy';
import { EngagementProxy } from './proxy/engagement.proxy';
import { AnalyticsProxy } from './proxy/analytics.proxy';
import { OwnerProxy } from './proxy/owner.proxy';
import { SeoProxy } from './proxy/seo.proxy';

const REDIS_OPTIONS = {
  host: new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').hostname,
  port: Number(new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').port) || 6379,
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting — tighter on AI routes (set per-route via ThrottlerGuard)
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
      { name: 'ai', ttl: 60_000, limit: 20 },
    ]),

    // Register all 10 ClientProxy instances — one per downstream service
    ClientsModule.register([
      { name: IDENTITY_CLIENT,   transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: SITES_CLIENT,      transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: AI_CLIENT,         transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: DEPLOY_CLIENT,     transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: DOMAINS_CLIENT,    transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: COMMERCE_CLIENT,   transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: BILLING_CLIENT,    transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: ENGAGEMENT_CLIENT, transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: ANALYTICS_CLIENT,  transport: Transport.REDIS, options: REDIS_OPTIONS },
      { name: OWNER_CLIENT,      transport: Transport.REDIS, options: REDIS_OPTIONS },
    ]),
  ],
  controllers: [
    // Auth & users (identity-service)
    AuthProxy,
    UsersProxy,
    CategoriesProxy,
    // SSE gateways
    PromptStreamGateway,
    DeployStreamGateway,
    NotificationStreamGateway,
    // Stub proxies — populated per phase
    SitesProxy,
    AiProxy,
    DeployProxy,
    DomainsProxy,
    CommerceProxy,
    BillingProxy,
    EngagementProxy,
    AnalyticsProxy,
    OwnerProxy,
    SeoProxy,
  ],
  providers: [
    // Global exception filter
    { provide: APP_FILTER, useClass: SharedExceptionFilter },
    // Global rate limiting
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Typed service clients
    IdentityClient,
    SitesClient,
    AiClient,
    DeployClient,
    DomainsClient,
    CommerceClient,
    BillingClient,
    EngagementClient,
    AnalyticsClient,
    OwnerClient,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(KillSwitchMiddleware).forRoutes('*');

    // Apply JWT middleware to all routes except the public ones
    // (public routes set skipAuth flag via the @Public() decorator)
    consumer
      .apply(AuthenticateJWTMiddleware)
      .exclude(
        { path: 'auth/signup', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'auth/forgot-password', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.POST },
        { path: 'categories', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET },
        { path: 'api', method: RequestMethod.GET },     // Swagger UI
        { path: 'api-json', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
