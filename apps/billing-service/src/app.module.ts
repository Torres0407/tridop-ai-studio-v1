import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Client } from 'pg';
import { BillingController } from './billing.controller';
import { IdempotencyGuard } from './webhooks/idempotencyGuard';
import { PaystackWebhook } from './webhooks/paystack.webhook';
import { PaystackHttpController } from './webhooks/paystack.http.controller';
import { SubscriptionLapseService } from './dunning/subscriptionLapse.service';
import { UserCreatedConsumer } from './events/userCreated.consumer';
import { ProcessedWebhookEventEntity } from './entities/processedWebhookEvent.entity';
import { PlanEntity } from './entities/plan.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PaymentEntity } from './entities/payment.entity';
import { CouponEntity } from './entities/coupon.entity';
import { ReferralEntity } from './entities/referral.entity';
import { AgencyEntity } from './entities/agency.entity';
import { AgencyClientEntity } from './entities/agencyClient.entity';

import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

async function ensureSchemaExists(url: string, schemaName: string) {
  try {
    const client = new Client({ connectionString: url });
    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
    await client.end();
  } catch (err) {
    console.warn(`[TypeOrm] Could not pre-create schema "${schemaName}":`, err);
  }
}

function parseUpstashRedisOptions(urlStr?: string) {
  if (!urlStr) return { host: 'localhost', port: 6379 };
  try {
    const u = new URL(urlStr);
    const isUpstashOrTls = u.protocol === 'rediss:' || u.hostname.includes('upstash.io');
    const config: any = {
      host: u.hostname || 'localhost',
      port: Number(u.port) || 6379,
      family: 4,
      retryStrategy: () => 1000,
      enableOfflineQueue: false,
    };
    if (u.password) config.password = decodeURIComponent(u.password);
    if (u.username) config.username = decodeURIComponent(u.username);
    if (isUpstashOrTls) {
      config.tls = { rejectUnauthorized: false };
    }
    return config;
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

const REDIS_OPTIONS = parseUpstashRedisOptions(process.env.REDIS_URL);

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const dbUrl = config.get<string>('BILLING_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgres://tridopai:tridopai@postgres:5432/tridopai';
        await ensureSchemaExists(dbUrl, 'billing');
        return {
          type: 'postgres',
          url: dbUrl,
          schema: 'billing',
          entities: [
            ProcessedWebhookEventEntity,
            PlanEntity,
            SubscriptionEntity,
            PaymentEntity,
            CouponEntity,
            ReferralEntity,
            AgencyEntity,
            AgencyClientEntity,
          ],
          synchronize: true,
          retryAttempts: 5,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      ProcessedWebhookEventEntity,
      PlanEntity,
      SubscriptionEntity,
      PaymentEntity,
      CouponEntity,
      ReferralEntity,
      AgencyEntity,
      AgencyClientEntity,
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: REDIS_OPTIONS,
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'events' }),
  ],
  controllers: [BillingController, PaystackHttpController, HealthController],
  providers: [
    IdempotencyGuard,
    PaystackWebhook,
    SubscriptionLapseService,
    UserCreatedConsumer
  ],
})
export class AppModule {}
