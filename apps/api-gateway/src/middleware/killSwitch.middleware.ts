import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class KillSwitchMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/health' || req.path.startsWith('/owner')) {
      next(); return;
    }

    try {
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        connectTimeout: 500,
        maxRetriesPerRequest: 0,
      });
      const isKilled = await redis.get('platform:killSwitch');
      await redis.quit();

      if (isKilled === 'true') {
        throw new ServiceUnavailableException('Platform is temporarily unavailable for maintenance');
      }
    } catch (err: any) {
      if (err instanceof ServiceUnavailableException) throw err;
    }

    next();
  }
}
