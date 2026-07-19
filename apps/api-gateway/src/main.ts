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

  // CORS — only allow the configured client origin
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
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

  // Health endpoint on the gateway itself
  app.getHttpAdapter().get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'api-gateway' });
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  logger.log(`api-gateway listening on :${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('api-gateway failed to start', error);
  process.exit(1);
});
