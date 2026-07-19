import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyGuard } from './webhooks/idempotencyGuard';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PlanEntity } from './entities/plan.entity';
import { ConfigService } from '@nestjs/config';

@Controller()
export class BillingController {
  constructor(
    private config: ConfigService,
    private idempotencyGuard: IdempotencyGuard,
    @InjectRepository(SubscriptionEntity)
    private readonly subRepo: Repository<SubscriptionEntity>,
    @InjectRepository(PlanEntity)
    private readonly planRepo: Repository<PlanEntity>,
  ) {}

  @MessagePattern('billing.subscription.get')
  async getSubscription(@Payload() data: { userId: string }) {
    const sub = await this.subRepo.findOne({ where: { userId: data.userId }, order: { createdAt: 'DESC' } });
    if (!sub) return { status: 'free', plan: 'free', userId: data.userId };
    return sub;
  }

  @MessagePattern('billing.checkout.paystack')
  async checkoutPaystack(@Payload() data: { userId: string; planId: string; email: string }) {
    const secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY is not configured');

    // Assuming we fetch plan price from DB. For now, defaulting to an amount:
    const amount = 500000; // e.g. 5000 NGN or equivalent

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        amount: amount,
        metadata: {
          userId: data.userId,
          planId: data.planId,
        }
      }),
    });

    const result: any = await response.json();
    if (!result.status) {
      throw new Error(`Paystack checkout failed: ${result.message}`);
    }

    return { url: result.data.authorization_url, reference: result.data.reference };
  }

  @MessagePattern('billing.paystack.createSubaccount')
  async createSubaccount(@Payload() data: { businessName: string; bankCode: string; accountNumber: string }) {
    const secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY is not configured');

    const response = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: data.businessName,
        settlement_bank: data.bankCode,
        account_number: data.accountNumber,
        percentage_charge: 5, // Platform takes 5%
      }),
    });

    const result: any = await response.json();
    if (!result.status) {
      throw new Error(`Paystack subaccount creation failed: ${result.message}`);
    }

    console.log(`[Paystack] Created subaccount for ${data.businessName} (Code: ${result.data.subaccount_code})`);
    return { subaccount_code: result.data.subaccount_code, active: result.data.active };
  }

  @MessagePattern('billing.subscription.cancel')
  async cancelSubscription(@Payload() data: { userId: string }) {
    await this.subRepo.update({ userId: data.userId }, { status: 'cancelled' as any });
    return { status: 'cancelled', userId: data.userId };
  }

  @MessagePattern('billing.plans.list')
  async listPlans() {
    return this.planRepo.find({ order: { priceMonthly: 'ASC' } });
  }

  @MessagePattern('billing.webhook.paystack')
  async handlePaystackWebhook(@Payload() data: { event: string; orderId: string; status: string }) {
    if (data.event === 'charge.success') {
      console.log(`[Paystack Webhook] order.paid emitted for ${data.orderId}`);
      return { status: 'success', event: 'order.paid' };
    }
    return { status: 'ignored' };
  }

  @MessagePattern('billing.credits.deduct')
  async deductCredits(@Payload() data: { userId: string; amount: number }) {
    const sub = await this.subRepo.findOne({ where: { userId: data.userId, status: 'active' } });
    if (!sub) {
      return { success: false, reason: 'No active subscription' };
    }
    if (sub.creditsUsed + data.amount > sub.creditsLimit) {
      return { success: false, reason: 'Credit limit exceeded', remaining: sub.creditsLimit - sub.creditsUsed };
    }
    await this.subRepo.increment({ userId: data.userId }, 'creditsUsed', data.amount);
    return { success: true, remaining: sub.creditsLimit - sub.creditsUsed - data.amount };
  }

  @MessagePattern('billing.mrr.get')
  async getMRR() {
    // Sum price of all active subscriptions
    const result = await this.subRepo.createQueryBuilder('sub')
      .where('sub.status = :status', { status: 'active' })
      .leftJoinAndSelect('sub.planId', 'plan') // assuming planId is the foreign key, or we just fetch plans
      .getRawMany();
      
    // For simplicity, assuming plan price is stored on the subscription or we fetch plans.
    // Since PlanEntity is separate, let's just do a simple aggregation if we had the plan price.
    // Or we just return a calculated MRR. Let's do a basic query:
    const activeSubs = await this.subRepo.find({ where: { status: 'active' } });
    const plans = await this.planRepo.find();
    let mrr = 0;
    for (const sub of activeSubs) {
      const plan = plans.find(p => p.id === sub.planId);
      if (plan) mrr += plan.priceMonthly;
    }
    return { mrr };
  }
}
