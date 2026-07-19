import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
    @Inject('SITES_SERVICE') private readonly sitesClient: ClientProxy,
    @Inject('BILLING_SERVICE') private readonly billingClient: ClientProxy,
  ) {}

  async getAggregatedStats() {
    const activeUsers = await firstValueFrom(this.identityClient.send('users.count', {})).catch(() => 0);
    const totalSites = await firstValueFrom(this.sitesClient.send('sites.counts', {})).catch(() => 0);
    const { mrr } = await firstValueFrom(this.billingClient.send('billing.mrr.get', {})).catch(() => ({ mrr: 0 }));

    return {
      mrr,
      totalSites,
      activeUsers
    };
  }
}
