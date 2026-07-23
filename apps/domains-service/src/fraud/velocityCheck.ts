import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class VelocityCheck implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly logger = new Logger(VelocityCheck.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
    this.redis.on('error', (err) => this.logger.warn(`Redis connection error: ${err.message}`));
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async isSafe(userId: string) {
    const key = `velocity:domain_registration:${userId}`;
    const count = await this.redis.get(key);
    
    // Hard limit: 5 domains per day to prevent abuse
    if (count && Number.parseInt(count, 10) >= 5) {
      this.logger.warn(`Velocity limit reached for user ${userId}`);
      return false;
    }

    await this.redis.incr(key);
    const ttl = await this.redis.ttl(key);
    if (ttl === -1) {
      // Set to expire in 24 hours
      await this.redis.expire(key, 60 * 60 * 24);
    }
    
    return true;
  }
}
