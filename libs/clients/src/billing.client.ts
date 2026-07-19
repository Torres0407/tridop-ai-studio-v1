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
  getRevenue(): Promise<any> {
    return this.send('billing.revenue.get', {});
  }
  getSubscription(payload: { siteId: string }): Promise<any> {
    return this.send('billing.subscription.get', payload);
  }
  initializeCheckout(payload: Record<string, unknown>): Promise<any> {
    return this.send('billing.checkout.paystack', payload);
  }
  createSubaccount(payload: Record<string, unknown>): Promise<any> {
    return this.send('billing.paystack.createSubaccount', payload);
  }
  cancelSubscription(payload: { subscriptionId: string }): Promise<any> {
    return this.send('billing.subscription.cancel', payload);
  }
  listPlans(): Promise<any> {
    return this.send('billing.plans.list', {});
  }
  deductCredits(payload: { userId: string; amount: number }): Promise<{ success: boolean; remaining?: number; reason?: string }> {
    return this.send('billing.credits.deduct', payload);
  }
  handleWebhook(payload: { event: string; orderId: string; status: string; raw?: any }): Promise<any> {
    return this.send('billing.webhook.paystack', payload);
  }
}
