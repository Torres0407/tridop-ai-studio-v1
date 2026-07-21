import 'reflect-metadata';
import { initTracing } from '@libs/common';
initTracing('identity-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('identity-service');

  // ─── 1. Redis microservice transport (no HTTP listener) ─────────────────────
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').hostname,
        port: Number(new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').port) || 6379,
      },
    },
  );
  microservice.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ─── 2. Secondary HTTP server for /health only (port 3001) ──────────────────
  const healthApp = await NestFactory.create(AppModule, { logger: false });
  await healthApp.listen(Number(process.env.HEALTH_PORT ?? 3000));
  logger.log(`Health endpoint listening on :${process.env.HEALTH_PORT ?? 3000}/health`);

  try {
    await microservice.listen();
    logger.log('identity-service listening on Redis transport');
  } catch (err: any) {
    logger.warn(`Redis transport offline (${err.message}). Service running in HTTP fallback mode.`);
  }
}

bootstrap().catch((err) => {
  console.error('identity-service failed to start', err);
  process.exit(1);
});
