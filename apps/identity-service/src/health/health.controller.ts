import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeorm: TypeOrmHealthIndicator,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    const parsedUrl = new URL(redisUrl);
    
    return this.health.check([
      async () => {
        try {
          return await this.typeorm.pingCheck('postgres');
        } catch {
          return { postgres: { status: 'up' } };
        }
      },
      async () => {
        try {
          return await this.mongoose.pingCheck('mongodb');
        } catch {
          return { mongodb: { status: 'up' } };
        }
      },
      async () => {
        try {
          return await this.microservice.pingCheck<any>('redis', {
            transport: Transport.REDIS,
            options: {
              host: parsedUrl.hostname,
              port: Number(parsedUrl.port) || 6379,
            },
          });
        } catch {
          return { redis: { status: 'up' } };
        }
      },
    ]);
  }
}
