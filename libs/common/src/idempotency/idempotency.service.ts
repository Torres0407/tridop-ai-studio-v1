import { Injectable, ConflictException } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Checks if an operation with the given idempotency key has already been executed or is in progress.
   * If not, it sets a lock for the specified TTL (default 24 hours).
   * @throws ConflictException if the key already exists (operation in progress or completed).
   */
  async checkAndLock(context: string, idempotencyKey: string, ttlSeconds = 86_400): Promise<void> {
    if (!idempotencyKey) {
      // If no key is provided, we skip idempotency check (useful for optional idempotency)
      return;
    }

    const redisKey = `idempotency:${context}:${idempotencyKey}`;
    
    // Set the key ONLY if it does not exist (NX), with expiration (EX)
    const acquired = await this.redis.set(redisKey, 'locked', 'EX', ttlSeconds, 'NX');
    
    if (!acquired) {
      throw new ConflictException(`Idempotency conflict: Operation with key ${idempotencyKey} is already being processed or has completed.`);
    }
  }

  /**
   * Completes an operation by updating the cache with the result.
   */
  async complete(context: string, idempotencyKey: string, result: string, ttlSeconds = 86_400): Promise<void> {
    if (!idempotencyKey) return;
    const redisKey = `idempotency:${context}:${idempotencyKey}`;
    await this.redis.set(redisKey, result, 'EX', ttlSeconds);
  }
}
