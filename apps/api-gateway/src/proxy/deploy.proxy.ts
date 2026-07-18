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
    return this.deployClient.triggerDeployment(data);
  }

  @Get('status/:siteId')
  @ApiOperation({ summary: 'Get deployment status' })
  async getStatus(@Param('siteId') siteId: string) {
    return this.deployClient.getDeploymentStatus({ siteId });
  }
}
