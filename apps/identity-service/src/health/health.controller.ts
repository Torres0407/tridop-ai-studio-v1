import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      info: { service: { status: 'up' } },
      error: {},
      details: { service: { status: 'up' } },
    };
  }
}
