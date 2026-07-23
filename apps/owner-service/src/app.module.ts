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
    ClientsModule.registerAsync([
      {
        name: 'IDENTITY_SERVICE',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').hostname,
            port: Number(new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').port) || 6379,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'SITES_SERVICE',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').hostname,
            port: Number(new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').port) || 6379,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'BILLING_SERVICE',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').hostname,
            port: Number(new URL(config.get<string>('REDIS_URL') || 'redis://redis:6379').port) || 6379,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OwnerController, OwnerUsersController, OwnerSitesController, HealthController],
  providers: [DashboardService, KillSwitchService],
})
export class AppModule {}
