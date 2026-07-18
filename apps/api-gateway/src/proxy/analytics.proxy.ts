// ─── api-gateway/src/proxy/analytics.proxy.ts ──────────────────────────────────
// STUB — HTTP controllers for analytics-service will be implemented in the
// corresponding build phase. Until then these are registered but return 503.
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsClient } from '@libs/clients';
import { SiteOwnershipGuard } from '@libs/common';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(SiteOwnershipGuard)
export class AnalyticsProxy {
  constructor(private readonly analyticsClient: AnalyticsClient) {}

  @Get('dashboard/site/:siteId')
  @ApiOperation({ summary: 'Get analytics dashboard for a site' })
  async getDashboard(@Param('siteId') siteId: string) {
    return this.analyticsClient.getDashboard({ siteId });
  }
}
