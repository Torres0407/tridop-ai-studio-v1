import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DeployClient } from '@libs/clients';
import { SiteOwnershipGuard } from '@libs/common';

@ApiTags('Deploy')
@ApiBearerAuth()
@Controller('deploy')
@UseGuards(SiteOwnershipGuard)
export class DeployProxy {
  constructor(private readonly deployClient: DeployClient) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger a deployment' })
  async triggerDeployment(@Body() data: { siteId: string, versionId?: string }) {
    return this.deployClient.triggerDeploy(data);
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get deployment status' })
  async getStatus(@Param('jobId') jobId: string) {
    return this.deployClient.getStatus(jobId);
  }
}
