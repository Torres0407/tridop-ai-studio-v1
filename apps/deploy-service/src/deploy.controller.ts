import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ScaffoldSiteBuild } from './engine/scaffoldSiteBuild';
import { RunStaticExport } from './engine/runStaticExport';

@Controller()
export class DeployController {
  constructor(
    private scaffold: ScaffoldSiteBuild,
    private runExport: RunStaticExport,
  ) {}

  @MessagePattern('deploy.trigger')
  async triggerDeploy(@Payload() data: { siteId: string }) {
    const buildPath = await this.scaffold.scaffold(data.siteId);
    await this.runExport.run(buildPath);
    return { status: 'triggered', path: buildPath, deployed: true };
  }

  @MessagePattern('deploy.status.get')
  async getStatus(@Payload() data: { siteId: string }) {
    return { siteId: data.siteId, status: 'deployed', lastDeployedAt: new Date().toISOString() };
  }

  @MessagePattern('deploy.rollback')
  async rollback(@Payload() data: { siteId: string; versionId: string }) {
    return { siteId: data.siteId, versionId: data.versionId, status: 'rolled_back' };
  }

  @MessagePattern('deploy.history.list')
  async listHistory(@Payload() data: { siteId: string }) {
    return [
      { id: 'deploy-1', siteId: data.siteId, status: 'success', timestamp: new Date().toISOString() },
    ];
  }
}
