import { initTracing } from '@libs/common';
initTracing('billing-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('billing-service');

  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').hostname,
      port: Number(new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').port) || 6379,
      retryAttempts: 10,
      retryDelay: 1000,
    },
  });

  try {
    await app.startAllMicroservices();
    logger.log('billing-service listening on Redis transport');
  } catch (err: any) {
    logger.warn(`Redis transport offline (${err.message}). Service running in HTTP fallback mode.`);
  }

  const healthPort = Number(process.env.HEALTH_PORT ?? 3000);
  await app.listen(healthPort, '0.0.0.0');
  logger.log(`Health endpoint listening on :${healthPort}/health`);
}

bootstrap().catch((err) => {
  console.error('billing-service failed to start', err);
  process.exit(1);
});
