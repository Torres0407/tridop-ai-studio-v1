import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { IdempotencyModule } from '@libs/common';

import { DomainsController } from './domains.controller';
import { ProvisionSubdomain } from './subdomain/provisionSubdomain';
import { SpaceshipRegistrar } from './registrar/spaceship';
import { DynadotRegistrar } from './registrar/dynadot';
import { CloudflareTransferJob } from './registrar/cloudflareTransfer';
import { CloudflareForSaaS } from './cloudflareForSaaS';
import { DomainLookup } from './domainLookup';
import { VelocityCheck } from './fraud/velocityCheck';
import { SubscriptionLapsedConsumer } from './events/subscriptionLapsed.consumer';
import { DeployCompletedConsumer } from './events/deployCompleted.consumer';
import { DomainEntity } from './entities/domain.entity';

@Module({
  imports: [
    IdempotencyModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DOMAINS_POSTGRES_URL', 'postgres://tridopai:tridopai@localhost:5432/tridopai'),
        schema: 'domains',
        entities: [DomainEntity],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([DomainEntity]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: Number(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'events' }),
  ],
  controllers: [DomainsController],
  providers: [
    ProvisionSubdomain,
    SpaceshipRegistrar,
    DynadotRegistrar,
    CloudflareTransferJob,
    CloudflareForSaaS,
    DomainLookup,
    VelocityCheck,
    SubscriptionLapsedConsumer,
    DeployCompletedConsumer
  ],
})
export class AppModule {}
