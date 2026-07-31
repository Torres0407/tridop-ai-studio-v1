import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Client } from 'pg';

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
        const dbUrl = config.get<string>('SITES_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgres://tridopai:tridopai@postgres:5432/tridopai';
        await ensureSchemaExists(dbUrl, 'sites');
        return {
          type: 'postgres',
          url: dbUrl,
          schema: 'sites',
          entities: [],
          synchronize: true,
          retryAttempts: 5,
        };
      },
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
        connection: REDIS_OPTIONS,
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
