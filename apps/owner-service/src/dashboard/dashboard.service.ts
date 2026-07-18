import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
    @Inject('SITES_SERVICE') private readonly sitesClient: ClientProxy,
  ) {}

  async getAggregatedStats() {
    const activeUsers = await firstValueFrom(this.identityClient.send('users.count', {})).catch(() => 0);
    const totalSites = await firstValueFrom(this.sitesClient.send('sites.counts', {})).catch(() => 0);

    return {
      mrr: 5000,
      totalSites,
      activeUsers
    };
  }
}
