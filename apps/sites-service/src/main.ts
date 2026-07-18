import { initTracing } from '@libs/common';
initTracing('sites-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('sites-service');

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
  logger.log('sites-service listening on Redis transport');
}

bootstrap().catch((err) => {
  console.error('sites-service failed to start', err);
  process.exit(1);
});
