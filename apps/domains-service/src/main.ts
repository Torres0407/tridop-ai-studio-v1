import { initTracing } from '@libs/common';
initTracing('domains-service');

import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions} from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('domains-service');

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
    logger.log('domains-service listening on Redis transport');
  } catch (err: any) {
    logger.warn(`Redis transport offline (${err.message}). Service running in HTTP fallback mode.`);
  }

  const healthPort = Number(process.env.HEALTH_PORT ?? 3000);
  await app.listen(healthPort, '0.0.0.0');
  logger.log(`Health endpoint listening on :${healthPort}/health`);
}

bootstrap().catch((error) => {
  console.error('domains-service failed to start', error);
  process.exit(1);
});
