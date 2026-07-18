// ─── libs/clients/src/engagement.client.ts ──────────────────────────────────
// STUB — implemented in Phase 7 (engagement-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const ENGAGEMENT_CLIENT = 'ENGAGEMENT_SERVICE';

@Injectable()
export class EngagementClient extends BaseServiceClient {
  constructor(@InjectClient(ENGAGEMENT_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  sendEmail(payload: Record<string, unknown>): Promise<never> {
    return this.send('email.send', payload);
  }
  sendNotification(payload: Record<string, unknown>): Promise<never> {
    return this.send('notifications.send', payload);
  }
  listContacts(payload: { siteId: string }): Promise<any> {
    return this.send('engagement.contacts.list', payload);
  }
  listForms(payload: { siteId: string }): Promise<any> {
    return this.send('engagement.forms.list', payload);
  }
  sendCampaignMessage(payload: { siteId: string; contactId: string; channel: string; message: string; to: string }): Promise<any> {
    return this.send('engagement.messages.send', payload);
  }
}
