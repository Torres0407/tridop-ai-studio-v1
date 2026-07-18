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
    return this.health.check([
      () => this.typeorm.pingCheck('postgres'),
      () => this.mongoose.pingCheck('mongodb'),
      () =>
        this.microservice.pingCheck<any>('redis', {
          transport: Transport.REDIS,
          options: { url: process.env.REDIS_URL },
        }),
    ]);
  }
}
