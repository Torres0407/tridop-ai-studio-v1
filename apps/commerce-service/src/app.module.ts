import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    TerminusModule,
    IdempotencyModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('COMMERCE_POSTGRES_URL') || config.get<string>('DATABASE_URL') || 'postgres://tridopai:tridopai@postgres:5432/tridopai',
        schema: 'commerce',
        entities: [ProductEntity, BookingEntity, OrderEntity, OrderItemEntity, InventoryEntity, CartEntity],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ProductEntity, BookingEntity, OrderEntity, OrderItemEntity, InventoryEntity, CartEntity]),
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
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  controllers: [CommerceController, HealthController],
  providers: [GoogleCalendarService, ProductsService, BookingsService, EventsConsumer],
})
export class AppModule {}
