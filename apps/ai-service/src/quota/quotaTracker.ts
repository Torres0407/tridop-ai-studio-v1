import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class QuotaTracker implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl);
    this.redis.on('error', (err) => console.warn(`[QuotaTracker] Redis error: ${err.message}`));
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async checkQuota(userId: string): Promise<boolean> {
    const key = `quota:${userId}`;
    const used = await this.redis.get(key);
    const limit = 100; // In reality, this would be fetched from the billing/user plan
    
    if (used && parseInt(used, 10) >= limit) {
      return false;
    }
    
    await this.redis.incr(key);
    // Set expiry to reset quota at end of month (approx 30 days) if not already set
    const ttl = await this.redis.ttl(key);
    if (ttl === -1) {
      await this.redis.expire(key, 60 * 60 * 24 * 30);
    }
    return true;
  }

  async getQuota(userId: string): Promise<{ used: number; limit: number; remaining: number }> {
    const key = `quota:${userId}`;
    const usedStr = await this.redis.get(key);
    const used = usedStr ? parseInt(usedStr, 10) : 0;
    const limit = 100; // Same as above, should be plan-dependent
    return { used, limit, remaining: Math.max(0, limit - used) };
  }
}
