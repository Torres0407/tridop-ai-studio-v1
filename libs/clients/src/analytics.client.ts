// ─── libs/clients/src/analytics.client.ts ───────────────────────────────────
// STUB — implemented in Phase 7 (analytics-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const ANALYTICS_CLIENT = 'ANALYTICS_SERVICE';

@Injectable()
export class AnalyticsClient extends BaseServiceClient {
  constructor(@InjectClient(ANALYTICS_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  getDashboard(data: { siteId: string }): Promise<any> {
    return this.send('analytics.dashboard.get', data);
  }
}
