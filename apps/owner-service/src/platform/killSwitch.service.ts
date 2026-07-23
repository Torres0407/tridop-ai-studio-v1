import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSettingsEntity } from '../entities/platformSettings.entity';

@Injectable()
export class KillSwitchService {
  constructor(
    @InjectRepository(PlatformSettingsEntity)
    private repo: Repository<PlatformSettingsEntity>
  ) {}

  async setKillSwitch(active: boolean) {
    let settings = await this.repo.findOne({ where: { id: 'global' } });
    if (!settings) settings = this.repo.create({ id: 'global' });
    settings.killSwitchActive = active;
    await this.repo.save(settings);

    // Sync to Redis
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    redis.on('error', () => {});
    await redis.set('platform:killSwitch', active ? 'true' : 'false');
    await redis.quit();

    return settings;
  }
}
