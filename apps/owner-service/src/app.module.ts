import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('OWNER_POSTGRES_URL', 'postgres://tridopai:tridopai@localhost:5432/tridopai'),
        schema: 'owner',
        entities: [PlatformSettingsEntity, OwnerActionLogEntity, FlaggedContentEntity, FeatureFlagEntity],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
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
            host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
            port: Number(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port),
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
            host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
            port: Number(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port),
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
            host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
            port: Number(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port),
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
