import { initTracing } from '@libs/common';
initTracing('domains-service');

import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions} from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('domains-service');

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

  const healthApp = await NestFactory.create(AppModule, { logger: false });
  const healthPort = Number(process.env.HEALTH_PORT ?? 3000);
  
  // Basic health check for now
  healthApp.getHttpAdapter().get('/health', (req, res) => res.send('ok'));
  
  await healthApp.listen(healthPort);
  logger.log(`Health endpoint listening on :${healthPort}/health`);

  await microservice.listen();
  logger.log('domains-service listening on Redis transport');
}

bootstrap().catch((error) => {
  console.error('domains-service failed to start', error);
  process.exit(1);
});
