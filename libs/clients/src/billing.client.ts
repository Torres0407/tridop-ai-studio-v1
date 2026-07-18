// ─── libs/clients/src/billing.client.ts ─────────────────────────────────────
// STUB — implemented in Phase 6 (billing-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const BILLING_CLIENT = 'BILLING_SERVICE';

@Injectable()
export class BillingClient extends BaseServiceClient {
  constructor(@InjectClient(BILLING_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  getRevenue(): Promise<never> {
    return this.send('billing.revenue.get', {});
  }
}
