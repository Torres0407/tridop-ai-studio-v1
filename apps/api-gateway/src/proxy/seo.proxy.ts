import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsClient } from '@libs/clients';
import { Public } from '@libs/common';

@ApiTags('SEO')
@Controller()
export class SeoProxy {
  constructor(private readonly analyticsClient: AnalyticsClient) {}

  @Public()
  @Get(':siteId/sitemap.xml')
  @ApiOperation({ summary: 'Get sitemap.xml for a site' })
  async getSitemap(@Param('siteId') siteId: string, @Res() res: Response) {
    const sitemap = await this.analyticsClient.generateSitemap({ pages: [] });
    res.header('Content-Type', 'application/xml');
    res.send(sitemap.xml);
  }

  @Public()
  @Get(':siteId/robots.txt')
  @ApiOperation({ summary: 'Get robots.txt for a site' })
  async getRobotsTxt(@Param('siteId') siteId: string, @Res() res: Response) {
    const robots = await this.analyticsClient.generateRobots();
    res.header('Content-Type', 'text/plain');
    res.send(robots.text);
  }
}
