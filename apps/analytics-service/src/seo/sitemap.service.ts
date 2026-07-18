import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SitemapService {
  constructor(private config: ConfigService) {}

  generateSitemap(pages: any[]) {
    const baseUrl = this.config.get<string>('BASE_URL', 'https://tridopai.app');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}</loc></url>
</urlset>`;
  }
}
