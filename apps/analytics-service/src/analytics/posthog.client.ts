import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PosthogClient {
  private readonly logger = new Logger(PosthogClient.name);

  constructor(private config: ConfigService) {}

  async getEvents(siteId: string) {
    const projectId = this.config.get<string>('POSTHOG_PROJECT_ID');
    const personalApiKey = this.config.get<string>('POSTHOG_PERSONAL_API_KEY');

    if (!projectId || !personalApiKey) {
      this.logger.error('PostHog credentials missing. Returning empty analytics.');
      throw new Error('Analytics integration not configured');
    }

    try {
      const apiBase = this.config.get<string>('POSTHOG_API_URL', 'https://app.posthog.com/api');
      // Basic query to fetch pageviews and uniques for a specific site
      const url = `${apiBase}/projects/${projectId}/insights/trend/?events=[{"id":"$pageview","math":"total"},{"id":"$pageview","math":"dau"}]&properties=[{"key":"siteId","value":"${siteId}","operator":"exact","type":"event"}]`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${personalApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`PostHog API Error: ${res.statusText}`);
      }

      const data: any = await res.json();
      
      // PostHog returns an array of results for each event queried.
      const pageviews = data.result?.[0]?.count || 0;
      const uniques = data.result?.[1]?.count || 0;

      return { pageviews, uniques };
    } catch (error) {
      this.logger.error(`Failed to fetch analytics for site ${siteId}`, error);
      throw error;
    }
  }
}
