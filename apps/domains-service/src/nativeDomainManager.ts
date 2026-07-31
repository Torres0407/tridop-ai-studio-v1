import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dns from 'node:dns/promises';

@Injectable()
export class NativeDomainManager {
  private readonly logger = new Logger(NativeDomainManager.name);

  constructor(private configService: ConfigService) {}

  async provisionHostname(domain: string) {
    this.logger.log(`Verifying native domain configuration for ${domain}`);
    const cnameTarget = this.configService.get<string>('PROXY_CNAME_TARGET', 'proxy.tridopai.app');

    try {
      const records = await dns.resolveCname(domain);
      const isVerified = records.some((r) => r.toLowerCase().includes(cnameTarget.toLowerCase()));
      
      this.logger.log(`CNAME resolution for ${domain}: ${records.join(', ')} (Verified: ${isVerified})`);
      return {
        domain,
        verified: isVerified,
        cnameTarget,
        status: isVerified ? 'active' : 'pending_dns',
      };
    } catch (err: any) {
      this.logger.warn(`DNS lookup failed for ${domain}: ${err.message}. Marking domain as registered.`);
      return {
        domain,
        verified: false,
        cnameTarget,
        status: 'pending_dns',
      };
    }
  }
}
