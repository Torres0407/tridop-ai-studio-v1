import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class DomainLookup implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly logger = new Logger(DomainLookup.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
    this.redis.on('error', (err) => this.logger.warn(`Redis connection error: ${err.message}`));
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async updateMap(domain: string, siteId: string) {
    this.logger.log(`Mapping domain ${domain} to site ${siteId}`);
    // Used by edge proxy to route incoming requests
    await this.redis.set(`domain_map:${domain}`, siteId);
    return true;
  }
}
