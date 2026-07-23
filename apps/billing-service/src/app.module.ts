import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
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

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('BILLING_POSTGRES_URL', 'postgres://tridopai:tridopai@localhost:5432/tridopai'),
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
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
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
        connection: {
          host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: Number(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port) || 6379,
        },
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
