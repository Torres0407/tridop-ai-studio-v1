import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { SeoController } from './seo/seo.controller';
import { PosthogClient } from './analytics/posthog.client';
import { SitemapService } from './seo/sitemap.service';
import { RobotsService } from './seo/robots.service';

@Module({
  controllers: [AnalyticsController, SeoController],
  providers: [PosthogClient, SitemapService, RobotsService],
})
export class AppModule {}
