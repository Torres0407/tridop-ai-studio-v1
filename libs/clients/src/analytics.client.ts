import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const ANALYTICS_CLIENT = 'ANALYTICS_SERVICE';

@Injectable()
export class AnalyticsClient extends BaseServiceClient {
  constructor(@InjectClient(ANALYTICS_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  getDashboard(data: { siteId: string }): Promise<any> {
    return this.send('analytics.dashboard.get', data);
  }
  getSummary(data: { siteId: string }): Promise<any> {
    return this.send('analytics.summary', data);
  }
  trackEvent(data: { siteId: string; event: string; properties?: any }): Promise<any> {
    return this.send('analytics.events.track', data);
  }
  getFunnel(data: { siteId: string }): Promise<any> {
    return this.send('analytics.funnel.get', data);
  }
  generateSitemap(data: { pages: any[] }): Promise<any> {
    return this.send('seo.sitemap.generate', data);
  }
  generateRobots(): Promise<any> {
    return this.send('seo.robots.generate', {});
  }
}
