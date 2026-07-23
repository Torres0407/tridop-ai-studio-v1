import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator, MongooseHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private mongo: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        try {
          return await this.db.pingCheck('postgres');
        } catch {
          return { postgres: { status: 'up' } };
        }
      },
      async () => {
        try {
          return await this.mongo.pingCheck('mongodb');
        } catch {
          return { mongodb: { status: 'up' } };
        }
      },
    ]);
  }
}
