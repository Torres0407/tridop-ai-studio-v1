import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'pg';
import { CommerceController } from './commerce.controller';
import { GoogleCalendarService } from './googleCalendar';
import { ProductEntity } from './entities/product.entity';
import { BookingEntity } from './entities/booking.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/orderItem.entity';
import { InventoryEntity } from './entities/inventory.entity';
import { CartEntity } from './entities/cart.entity';

import { BullModule } from '@nestjs/bullmq';
import { IdempotencyModule } from '@libs/common';
import { ProductsService } from './products/products.service';
import { BookingsService } from './bookings/bookings.service';
import { EventsConsumer } from './events.consumer';

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
    IdempotencyModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const dbUrl = config.get<string>('COMMERCE_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgres://tridopai:tridopai@postgres:5432/tridopai';
        await ensureSchemaExists(dbUrl, 'commerce');
        return {
          type: 'postgres',
          url: dbUrl,
          schema: 'commerce',
          entities: [ProductEntity, BookingEntity, OrderEntity, OrderItemEntity, InventoryEntity, CartEntity],
          synchronize: true,
          retryAttempts: 5,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ProductEntity, BookingEntity, OrderEntity, OrderItemEntity, InventoryEntity, CartEntity]),
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
  controllers: [CommerceController, HealthController],
  providers: [GoogleCalendarService, ProductsService, BookingsService, EventsConsumer],
})
export class AppModule {}
