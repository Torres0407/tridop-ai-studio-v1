import 'reflect-metadata';
import { initTracing } from '@libs/common';
initTracing('commerce-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('commerce-service');

  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      const isTls = parsed.protocol === 'rediss:' || parsed.hostname.includes('upstash.io');
      const redisOptions: any = {
        host: parsed.hostname || 'redis',
        port: Number(parsed.port) || 6379,
        family: 4,
        retryAttempts: 10,
        retryDelay: 3000,
      };

      if (parsed.password) {
        redisOptions.password = decodeURIComponent(parsed.password);
      }
      if (parsed.username) {
        redisOptions.username = decodeURIComponent(parsed.username);
      }
      if (isTls) {
        redisOptions.tls = { rejectUnauthorized: false };
      }

      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.REDIS,
        options: redisOptions,
      });

      await app.startAllMicroservices();
      logger.log('commerce-service listening on Upstash Redis transport');
    } catch (err: any) {
      logger.warn(`Redis transport offline (${err.message}). Service running in HTTP fallback mode.`);
    }
  } else {
    logger.warn('REDIS_URL not configured. Service running in HTTP fallback mode.');
  }

  const portEnv = process.env.PORT || process.env.HEALTH_PORT;
  const healthPort = portEnv && !isNaN(Number(portEnv)) && Number(portEnv) > 0 ? Number(portEnv) : 3000;

  await app.listen(healthPort, '0.0.0.0');
  logger.log(`Health endpoint listening on :${healthPort}/health`);
}

bootstrap().catch((err) => {
  console.error('commerce-service failed to start', err);
  process.exit(1);
});
