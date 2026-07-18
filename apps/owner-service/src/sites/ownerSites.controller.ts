import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

/**
 * Handles owner-level site management by delegating to sites-service.
 * owner-service has no direct DB access to site data.
 */
@Controller()
export class OwnerSitesController {
  constructor(
    @Inject('SITES_SERVICE') private readonly sitesClient: ClientProxy,
  ) {}

  @MessagePattern('owner.sites.takedown')
  async takedownSite(@Payload() data: { siteId: string; reason: string }) {
    return firstValueFrom(this.sitesClient.send('sites.takedown', data));
  }
}
