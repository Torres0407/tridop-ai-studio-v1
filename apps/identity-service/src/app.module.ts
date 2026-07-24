import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Postgres — schema: identity only
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dbUrl = process.env.IDENTITY_POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://tridopai:tridopai@postgres:5432/tridopai?schema=identity';
        await ensureSchemaExists(dbUrl, 'identity');
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [UserEntity, SessionEntity],
          synchronize: true,
          retryAttempts: 5,
        };
      },
    }),
    TypeOrmModule.forFeature([UserEntity, SessionEntity]),

    // MongoDB — database: identity_db only
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://mongodb:27017/identity_db',
      }),
    }),
    MongooseModule.forFeature([
      { name: BusinessProfile.name, schema: BusinessProfileSchema },
    ]),

    // BullMQ — publishes USER_CREATED
    BullModule.forRoot({
      connection: {
        host: new URL(process.env.REDIS_URL ?? 'redis://redis:6379').hostname,
        port: Number(new URL(process.env.REDIS_URL ?? 'redis://redis:6379').port) || 6379,
      },
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
