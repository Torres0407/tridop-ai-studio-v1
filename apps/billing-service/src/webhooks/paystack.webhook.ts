import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyGuard } from './idempotencyGuard';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaystackWebhook {
  private readonly logger = new Logger(PaystackWebhook.name);

  constructor(
    private guard: IdempotencyGuard,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

  async process(event: any) {
    // Paystack usually uses a reference or id for idempotency
    const eventId = event.data?.id?.toString() || event.data?.reference || Math.random().toString();
    const isDuplicate = await this.guard.checkAndRecord('paystack', eventId);
    if (isDuplicate) {
      this.logger.debug(`Skipping duplicate Paystack event: ${eventId}`);
      return;
    }

    this.logger.log(`Processing Paystack event: ${event.event}`);

    try {
      switch (event.event) {
        case 'subscription.create':
        case 'subscription.enable': {
          const sub = event.data;
          await this.subscriptionRepo.update(
            { paystackSubscriptionCode: sub.subscription_code },
            { 
              status: sub.status === 'active' ? 'active' : 'past_due',
              currentPeriodEnd: new Date(sub.next_payment_date),
              cancelAtPeriodEnd: false, // Paystack doesn't natively expose this easily on creation
            }
          );
          break;
        }
        case 'subscription.disable': {
          const sub = event.data;
          await this.subscriptionRepo.update(
            { paystackSubscriptionCode: sub.subscription_code },
            { status: 'canceled' }
          );
          break;
        }
        case 'charge.success': {
          const charge = event.data;
          if (charge.plan?.subscription_code) {
            const sub = await this.subscriptionRepo.findOne({ 
              where: { paystackSubscriptionCode: charge.plan.subscription_code }
            });
            if (sub) {
              const payment = this.paymentRepo.create({
                userId: sub.userId,
                subscriptionId: sub.id,
                amount: charge.amount / 100, // Paystack amount is in kobo
                currency: charge.currency,
                provider: 'paystack',
                providerPaymentId: charge.reference,
                status: 'succeeded',
              });
              await this.paymentRepo.save(payment);
            }
          }
          break;
        }
      }
    } catch (err) {
      this.logger.error(`Error processing Paystack event ${eventId}`, err);
      throw err;
    }
  }
}
