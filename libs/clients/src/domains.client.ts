// ─── libs/clients/src/domains.client.ts ─────────────────────────────────────
// STUB — implemented in Phase 5 (domains-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const DOMAINS_CLIENT = 'DOMAINS_SERVICE';

@Injectable()
export class DomainsClient extends BaseServiceClient {
  constructor(@InjectClient(DOMAINS_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  updateLookup(payload: Record<string, unknown>): Promise<never> {
    return this.send('domains.lookup.update', payload);
  }
  provisionSubdomain(payload: Record<string, unknown>): Promise<never> {
    return this.send('domains.subdomain.provision', payload);
  }
}
