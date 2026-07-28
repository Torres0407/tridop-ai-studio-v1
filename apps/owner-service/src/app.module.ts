import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'pg';
import { OwnerController } from './owner.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { KillSwitchService } from './platform/killSwitch.service';
import { PlatformSettingsEntity } from './entities/platformSettings.entity';
import { OwnerActionLogEntity } from './entities/ownerActionLog.entity';
import { FlaggedContentEntity } from './entities/flaggedContent.entity';
import { FeatureFlagEntity } from './entities/featureFlag.entity';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { OwnerUsersController } from './users/ownerUsers.controller';
import { OwnerSitesController } from './sites/ownerSites.controller';

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
        const dbUrl = config.get<string>('OWNER_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgres://tridopai:tridopai@postgres:5432/tridopai';
        await ensureSchemaExists(dbUrl, 'owner');
        return {
          type: 'postgres',
          url: dbUrl,
          schema: 'owner',
          entities: [PlatformSettingsEntity, OwnerActionLogEntity, FlaggedContentEntity, FeatureFlagEntity],
          synchronize: true,
          retryAttempts: 5,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PlatformSettingsEntity, OwnerActionLogEntity, FlaggedContentEntity, FeatureFlagEntity]),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.REDIS,
        options: REDIS_OPTIONS,
      },
      {
        name: 'SITES_SERVICE',
        transport: Transport.REDIS,
        options: REDIS_OPTIONS,
      },
      {
        name: 'BILLING_SERVICE',
        transport: Transport.REDIS,
        options: REDIS_OPTIONS,
      },
    ]),
  ],
  controllers: [OwnerController, OwnerUsersController, OwnerSitesController, HealthController],
  providers: [DashboardService, KillSwitchService],
})
export class AppModule {}
