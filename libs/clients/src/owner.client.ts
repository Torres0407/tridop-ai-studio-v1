// ─── libs/clients/src/owner.client.ts ───────────────────────────────────────
// STUB — implemented in Phase 8 (owner-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const OWNER_CLIENT = 'OWNER_SERVICE';

@Injectable()
export class OwnerClient extends BaseServiceClient {
  constructor(@InjectClient(OWNER_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  getDashboardStats(): Promise<any> {
    return this.send('owner.dashboard.get', {});
  }
  setKillSwitch(payload: { active: boolean }): Promise<any> {
    return this.send('owner.platform.killSwitch.set', payload);
  }
  flagContent(payload: { content: string }): Promise<any> {
    return this.send('owner.moderation.flag', payload);
  }
  reviewContent(payload: { id: string; status: string }): Promise<any> {
    return this.send('owner.moderation.review', payload);
  }
  listFlags(): Promise<any> {
    return this.send('owner.featureFlags.list', {});
  }
  setFlag(payload: { id: string; enabled: boolean }): Promise<any> {
    return this.send('owner.featureFlags.set', payload);
  }
}
