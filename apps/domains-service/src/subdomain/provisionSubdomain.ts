import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProvisionSubdomain {
  constructor(private configService: ConfigService) {}

  async provision(slug: string, siteId: string) {
    const base = this.configService.get('FREE_SUBDOMAIN_BASE', 'tridopai.app');
    const domain = `${slug}.${base}`;
    // Provisioning logic
    return { domain, type: 'subdomain', siteId };
  }
}
