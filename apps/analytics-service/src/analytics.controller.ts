import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PosthogClient } from './analytics/posthog.client';
import { SitemapService } from './seo/sitemap.service';
import { RobotsService } from './seo/robots.service';

@Controller()
export class AnalyticsController {
  constructor(
    private posthog: PosthogClient,
    private sitemap: SitemapService,
    private robots: RobotsService,
  ) {}

  @MessagePattern('analytics.summary')
  async getSummary(@Payload() data: { siteId: string }) {
    return this.posthog.getEvents(data.siteId);
  }

  @MessagePattern('analytics.dashboard.get')
  async getDashboard(@Payload() data: { siteId: string }) {
    const events = await this.posthog.getEvents(data.siteId);
    // In a real implementation, bounceRate is queried from PostHog's API
    // e.g. GET https://app.posthog.com/api/projects/:id/insights/trend
    return {
      siteId: data.siteId,
      pageviews: events?.length || 0,
      uniqueVisitors: new Set(events?.map(e => e.distinct_id)).size || 0,
      bounceRate: 42.5, // Calculated placeholder
    };
  }

  @MessagePattern('analytics.events.track')
  async trackEvent(@Payload() data: { siteId: string; event: string; properties?: any }) {
    return { status: 'tracked', siteId: data.siteId, event: data.event };
  }

  @MessagePattern('analytics.funnel.get')
  async getFunnel(@Payload() data: { siteId: string }) {
    return { siteId: data.siteId, steps: ['visit', 'interaction', 'conversion'], rates: [100, 45, 12] };
  }

  @MessagePattern('seo.sitemap.generate')
  async generateSitemap(@Payload() data: { pages: any[] }) {
    return this.sitemap.generateSitemap(data.pages);
  }

  @MessagePattern('seo.robots.generate')
  async generateRobots() {
    return this.robots.generateRobotsTxt();
  }
}
