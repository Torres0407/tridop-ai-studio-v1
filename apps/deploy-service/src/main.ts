import { initTracing } from '@libs/common';
initTracing('deploy-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('deploy-service');

  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  let redisHost = 'redis';
  let redisPort = 6379;
  try {
    const parsed = new URL(process.env.REDIS_URL || 'redis://redis:6379');
    redisHost = parsed.hostname || 'redis';
    redisPort = Number(parsed.port) || 6379;
  } catch {
    redisHost = 'redis';
    redisPort = 6379;
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisHost,
      port: redisPort,
      retryAttempts: 10,
      retryDelay: 1000,
    },
  });

  try {
    await app.startAllMicroservices();
    logger.log('deploy-service listening on Redis transport');
  } catch (err: any) {
    logger.warn(`Redis transport offline (${err.message}). Service running in HTTP fallback mode.`);
  }

  const healthPort = Number(process.env.HEALTH_PORT ?? 3000);
  await app.listen(healthPort, '0.0.0.0');
  logger.log(`Health endpoint listening on :${healthPort}/health`);
}

bootstrap().catch((err) => {
  console.error('deploy-service failed to start', err);
  process.exit(1);
});
