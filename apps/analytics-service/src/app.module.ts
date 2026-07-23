import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsController } from './analytics.controller';
import { SeoController } from './seo/seo.controller';
import { HealthController } from './health/health.controller';
import { PosthogClient } from './analytics/posthog.client';
import { SitemapService } from './seo/sitemap.service';
import { RobotsService } from './seo/robots.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
  ],
  controllers: [AnalyticsController, SeoController, HealthController],
  providers: [PosthogClient, SitemapService, RobotsService],
})
export class AppModule {}
