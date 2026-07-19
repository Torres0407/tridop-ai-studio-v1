import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScaffoldSiteBuild } from './engine/scaffoldSiteBuild';
import { RunStaticExport } from './engine/runStaticExport';
import { DeployHistoryEntity } from './entities/deployHistory.entity';

@Controller()
export class DeployController {
  constructor(
    private scaffold: ScaffoldSiteBuild,
    private runExport: RunStaticExport,
    @InjectRepository(DeployHistoryEntity)
    private readonly historyRepo: Repository<DeployHistoryEntity>,
  ) {}

  @MessagePattern('deploy.trigger')
  async triggerDeploy(@Payload() data: { siteId: string }) {
    // 1. Create a pending record
    const record = this.historyRepo.create({ siteId: data.siteId, status: 'pending' });
    await this.historyRepo.save(record);

    try {
      const buildPath = await this.scaffold.scaffold(data.siteId);
      await this.runExport.run(buildPath);
      
      record.status = 'success';
      await this.historyRepo.save(record);

      return { status: 'triggered', path: buildPath, deployed: true, historyId: record.id };
    } catch (err) {
      record.status = 'failed';
      await this.historyRepo.save(record);
      throw err;
    }
  }

  @MessagePattern('deploy.status.get')
  async getStatus(@Payload() data: { siteId: string }) {
    const lastDeploy = await this.historyRepo.findOne({
      where: { siteId: data.siteId },
      order: { timestamp: 'DESC' },
    });
    return {
      siteId: data.siteId,
      status: lastDeploy ? lastDeploy.status : 'not_deployed',
      lastDeployedAt: lastDeploy ? lastDeploy.timestamp.toISOString() : null,
    };
  }

  @MessagePattern('deploy.rollback')
  async rollback(@Payload() data: { siteId: string; versionId: string }) {
    const record = this.historyRepo.create({ siteId: data.siteId, versionId: data.versionId, status: 'rolled_back' });
    await this.historyRepo.save(record);
    return { siteId: data.siteId, versionId: data.versionId, status: 'rolled_back' };
  }

  @MessagePattern('deploy.history.list')
  async listHistory(@Payload() data: { siteId: string }) {
    return this.historyRepo.find({
      where: { siteId: data.siteId },
      order: { timestamp: 'DESC' },
      take: 20,
    });
  }
}
