import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Client } from 'pg';
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

@Module({
  imports: [
    TerminusModule,
    IdempotencyModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const dbUrl = config.get<string>('DOMAINS_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgres://tridopai:tridopai@postgres:5432/tridopai';
        await ensureSchemaExists(dbUrl, 'domains');
        return {
          type: 'postgres',
          url: dbUrl,
          schema: 'domains',
          entities: [DomainEntity],
          synchronize: true,
          retryAttempts: 5,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([DomainEntity]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').hostname,
          port: Number(new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').port) || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'events' }),
  ],
  controllers: [DomainsController, HealthController],
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
