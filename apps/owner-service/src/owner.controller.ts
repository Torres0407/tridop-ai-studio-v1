import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard/dashboard.service';
import { KillSwitchService } from './platform/killSwitch.service';
import { FlaggedContentEntity } from './entities/flaggedContent.entity';
import { FeatureFlagEntity } from './entities/featureFlag.entity';

@Controller()
export class OwnerController {
  constructor(
    private dashboard: DashboardService,
    private killSwitch: KillSwitchService,
    @InjectRepository(FlaggedContentEntity)
    private readonly flaggedRepo: Repository<FlaggedContentEntity>,
    @InjectRepository(FeatureFlagEntity)
    private readonly flagRepo: Repository<FeatureFlagEntity>,
  ) {}

  @MessagePattern('owner.dashboard.get')
  async getDashboard() {
    return this.dashboard.getAggregatedStats();
  }

  @MessagePattern('owner.platform.killSwitch.set')
  async setKillSwitch(@Payload() data: { active: boolean }) {
    return this.killSwitch.setKillSwitch(data.active);
  }

  @MessagePattern('owner.moderation.flag')
  async flagContent(@Payload() data: { content: string }) {
    const flagged = this.flaggedRepo.create({ content: data.content, status: 'pending' });
    return this.flaggedRepo.save(flagged);
  }

  @MessagePattern('owner.moderation.review')
  async reviewContent(@Payload() data: { id: string; status: string }) {
    await this.flaggedRepo.update({ id: data.id }, { status: data.status });
    return this.flaggedRepo.findOne({ where: { id: data.id } });
  }

  @MessagePattern('owner.featureFlags.list')
  async listFlags() {
    return this.flagRepo.find();
  }

  @MessagePattern('owner.featureFlags.set')
  async setFlag(@Payload() data: { id: string; enabled: boolean }) {
    await this.flagRepo.save({ id: data.id, enabled: data.enabled });
    return this.flagRepo.findOne({ where: { id: data.id } });
  }
}
