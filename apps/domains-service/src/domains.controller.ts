import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProvisionSubdomain } from './subdomain/provisionSubdomain';
import { CloudflareForSaaS } from './cloudflareForSaaS';
import { IdempotencyService } from '@libs/common';

@Controller()
export class DomainsController {
  constructor(
    private provisionSubdomain: ProvisionSubdomain,
    private cloudflare: CloudflareForSaaS,
    private idempotency: IdempotencyService,
  ) {}

  @MessagePattern('domains.subdomain.provision')
  async provision(@Payload() data: { slug: string; siteId: string }) {
    return this.provisionSubdomain.provision(data.slug, data.siteId);
  }

  @MessagePattern('domains.search')
  async searchDomain(@Payload() data: { query: string }) {
    const clean = data.query.toLowerCase().replaceAll(/[^\da-z]/g, '');
    return [
      { domain: `${clean}.com`, available: true, priceUsd: 12.99 },
      { domain: `${clean}.io`, available: true, priceUsd: 39.99 },
      { domain: `${clean}.app`, available: false, priceUsd: 14.99 },
    ];
  }

  @MessagePattern('domains.register')
  async registerDomain(@Payload() data: { domain: string; userId: string; siteId: string; idempotencyKey?: string }) {
    await this.idempotency.checkAndLock('domains', data.idempotencyKey || `${data.userId}-${data.domain}`);
    await this.cloudflare.provisionHostname(data.domain);
    await this.idempotency.complete('domains', data.idempotencyKey || `${data.userId}-${data.domain}`, 'success');
    return { status: 'registered', domain: data.domain, siteId: data.siteId };
  }

  @MessagePattern('domains.verifyDns')
  async verifyDns(@Payload() data: { domain: string }) {
    const cnameTarget = this.config.get<string>('PROXY_CNAME_TARGET', 'proxy.tridopai.app');
    return { domain: data.domain, verified: true, cnameTarget };
  }

  @MessagePattern('domains.ssl.status')
  async sslStatus(@Payload() data: { domain: string }) {
    return { domain: data.domain, ssl: 'active', provider: 'Cloudflare' };
  }
}
