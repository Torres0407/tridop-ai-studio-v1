import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { TerminusModule } from '@nestjs/terminus';
import { Client } from 'pg';

import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';
import { BusinessProfile, BusinessProfileSchema } from './models/businessProfile.model';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { BusinessProfileController } from './business-profile/businessProfile.controller';
import { BusinessProfileService } from './business-profile/businessProfile.service';
import { HealthController } from './health/health.controller';

import { EVENT_NAMES } from '@libs/common';

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
  if (!urlStr) return { host: 'redis', port: 6379 };
  try {
    const u = new URL(urlStr);
    const isUpstashOrTls = u.protocol === 'rediss:' || u.hostname.includes('upstash.io');
    const config: any = {
      host: u.hostname || 'localhost',
      port: Number(u.port) || 6379,
      family: 4,
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
      enableOfflineQueue: false,
    };
    if (u.password) config.password = decodeURIComponent(u.password);
    if (u.username) config.username = decodeURIComponent(u.username);
    if (isUpstashOrTls) {
      config.tls = { rejectUnauthorized: false };
    }
    return config;
  } catch {
    return { host: 'redis', port: 6379 };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Postgres — schema: identity only
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const dbUrl = config.get<string>('IDENTITY_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgresql://tridopai:tridopai@postgres:5432/tridopai?schema=identity';
        await ensureSchemaExists(dbUrl, 'identity');
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [UserEntity, SessionEntity],
          synchronize: true,
          retryAttempts: 5,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity, SessionEntity]),

    // MongoDB — database: identity_db only
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') || config.get<string>('MONGO_URL') || 'mongodb://mongodb:27017/identity_db',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: BusinessProfile.name, schema: BusinessProfileSchema },
    ]),

    // BullMQ — publishes USER_CREATED (configured for Upstash Redis dynamically)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: parseUpstashRedisOptions(config.get<string>('REDIS_URL')),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: EVENT_NAMES.USER_CREATED,
    }),

    TerminusModule,
  ],
  controllers: [
    AuthController,
    UsersController,
    BusinessProfileController,
    HealthController,
  ],
  providers: [AuthService, UsersService, BusinessProfileService],
})
export class AppModule { }
