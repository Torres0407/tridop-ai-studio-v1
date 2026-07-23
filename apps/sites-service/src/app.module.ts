import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { SitesController } from './sites/sites.controller';
import { SitesService } from './sites/sites.service';
import { BlocksService } from './sites/blocks.service';
import { VersionsService } from './sites/versions.service';
import { RecordsService } from './sites/records.service';

import { SiteSchemaModel, SiteSchemaSchema } from './models/siteSchema.model';
import { BlockModel, BlockSchema } from './models/block.model';
import { DynamicRecordModel, DynamicRecordSchema } from './models/dynamicRecord.model';
import { VersionSnapshotModel, VersionSnapshotSchema } from './models/versionSnapshot.model';
import { TemplateModel, TemplateSchema } from './models/template.model';
import { ABTestModel, ABTestSchema } from './models/abTest.model';

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
        url: config.get<string>('SITES_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgres://tridopai:tridopai@postgres:5432/tridopai',
        schema: 'sites',
        entities: [],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL') || config.get<string>('MONGODB_URI') || 'mongodb://mongodb:27017/sites_db',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: SiteSchemaModel.name, schema: SiteSchemaSchema },
      { name: BlockModel.name, schema: BlockSchema },
      { name: DynamicRecordModel.name, schema: DynamicRecordSchema },
      { name: VersionSnapshotModel.name, schema: VersionSnapshotSchema },
      { name: TemplateModel.name, schema: TemplateSchema },
      { name: ABTestModel.name, schema: ABTestSchema },
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
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  controllers: [SitesController, HealthController],
  providers: [SitesService, BlocksService, VersionsService, RecordsService],
})
export class AppModule {}
