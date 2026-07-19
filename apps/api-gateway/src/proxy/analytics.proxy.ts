// ─── api-gateway/src/proxy/analytics.proxy.ts ──────────────────────────────────
// STUB — HTTP controllers for analytics-service will be implemented in the
// corresponding build phase. Until then these are registered but return 503.
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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

  @Get('summary/site/:siteId')
  @ApiOperation({ summary: 'Get summary for a site' })
  async getSummary(@Param('siteId') siteId: string) {
    return this.analyticsClient.getSummary({ siteId });
  }

  @Post('events/site/:siteId')
  @ApiOperation({ summary: 'Track an event for a site' })
  async trackEvent(@Param('siteId') siteId: string, @Body() data: { event: string; properties?: any }) {
    return this.analyticsClient.trackEvent({ siteId, ...data });
  }

  @Get('funnel/site/:siteId')
  @ApiOperation({ summary: 'Get funnel for a site' })
  async getFunnel(@Param('siteId') siteId: string) {
    return this.analyticsClient.getFunnel({ siteId });
  }
}
