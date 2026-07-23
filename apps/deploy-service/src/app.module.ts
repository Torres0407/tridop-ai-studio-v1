import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { DeployController } from './deploy.controller';
import { ScaffoldSiteBuild } from './engine/scaffoldSiteBuild';
import { InjectSiteData } from './engine/injectSiteData';
import { RunStaticExport } from './engine/runStaticExport';
import { InjectSeo } from './engine/injectSeo';
import { InjectAnalytics } from './engine/injectAnalytics';
import { BuildWorker } from './jobs/buildWorker';
import { DomainRegisteredConsumer } from './events/domainRegistered.consumer';
import { LiveSiteEntity } from './entities/liveSite.entity';
import { DeployHistoryEntity } from './entities/deployHistory.entity';

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
        url: config.get<string>('DEPLOY_POSTGRES_URL', 'postgres://tridopai:tridopai@localhost:5432/tridopai'),
        schema: 'deploy',
        entities: [LiveSiteEntity, DeployHistoryEntity],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([LiveSiteEntity, DeployHistoryEntity]),
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
  controllers: [DeployController, HealthController],
  providers: [
    ScaffoldSiteBuild,
    InjectSiteData,
    RunStaticExport,
    InjectSeo,
    InjectAnalytics,
    BuildWorker,
    DomainRegisteredConsumer,
  ],
})
export class AppModule {}
