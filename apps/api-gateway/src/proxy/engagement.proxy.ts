// ─── api-gateway/src/proxy/engagement.proxy.ts ──────────────────────────────────
// STUB — HTTP controllers for engagement-service will be implemented in the
// corresponding build phase. Until then these are registered but return 503.
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EngagementClient } from '@libs/clients';
import { SiteOwnershipGuard } from '@libs/common';

@ApiTags('Engagement')
@ApiBearerAuth()
@Controller('engagement')
@UseGuards(SiteOwnershipGuard)
export class EngagementProxy {
  constructor(private readonly engagementClient: EngagementClient) {}

  @Get('contacts/site/:siteId')
  @ApiOperation({ summary: 'List contacts for a site' })
  async listContacts(@Param('siteId') siteId: string) {
    return this.engagementClient.listContacts({ siteId });
  }

  @Get('forms/site/:siteId')
  @ApiOperation({ summary: 'List form submissions for a site' })
  async listForms(@Param('siteId') siteId: string) {
    return this.engagementClient.listForms({ siteId });
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a campaign message' })
  async sendCampaignMessage(@Body() data: { siteId: string; contactId: string; channel: string; message: string; to: string }) {
    return this.engagementClient.sendCampaignMessage(data);
  }
}
