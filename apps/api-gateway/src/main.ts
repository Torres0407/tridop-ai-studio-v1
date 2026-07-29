import 'reflect-metadata';
import { initTracing } from '@libs/common';
initTracing('api-gateway');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('api-gateway');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  // CORS — allow Vite dev server, Next.js, and configured origins
  const allowedOrigins = process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // Swagger — aggregated OpenAPI doc
  const config = new DocumentBuilder()
    .setTitle('TridopAI API')
    .setDescription('TridopAI platform API — all services proxied through this gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Root endpoint for platform overview
  app.getHttpAdapter().get('/', (_req, res) => {
    res.status(200).json({
      service: 'TridopAI API Gateway',
      status: 'online',
      docs: '/api',
      health: '/health',
    });
  });

  // Health endpoint on the gateway itself
  app.getHttpAdapter().get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'api-gateway' });
  });

  const portEnv = process.env.PORT || process.env.HEALTH_PORT;
  const port = portEnv && !isNaN(Number(portEnv)) && Number(portEnv) > 0 ? Number(portEnv) : 4000;

  await app.listen(port, '0.0.0.0');
  logger.log(`api-gateway listening on :${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('api-gateway failed to start', error);
  process.exit(1);
});
