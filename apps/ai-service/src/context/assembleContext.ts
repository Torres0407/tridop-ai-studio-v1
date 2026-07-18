import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AssembleContext {
  constructor(
    @Inject('SITES_SERVICE') private sitesClient: ClientProxy,
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
  ) {}

  async assemble(userId: string, siteId: string) {
    try {
      const site = await firstValueFrom(this.sitesClient.send('sites.findById', { siteId }));
      const profile = await firstValueFrom(this.identityClient.send('businessProfile.get', { userId }));
      
      return { site, profile };
    } catch (error) {
      console.warn('Failed to assemble full context, returning partial/fallback context');
      return { userId, siteId, fallback: true };
    }
  }
}
