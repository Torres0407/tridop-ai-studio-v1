// ─── api-gateway/src/proxy/billing.proxy.ts ──────────────────────────────────
import { Controller, Get, Post, Body, Param, UseGuards, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingClient } from '@libs/clients';
import { SiteOwnershipGuard } from '@libs/common';
import { JwtGuard, Public } from '@libs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(JwtGuard)
export class BillingProxy {
  constructor(private readonly billingClient: BillingClient) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List all subscription plans' })
  async listPlans() {
    try {
      return await this.billingClient.listPlans();
    } catch {
      return [
        { id: 'free', name: 'Free Starter', price: 0, interval: 'month' },
        { id: 'pro', name: 'Pro Developer', price: 19, interval: 'month' },
        { id: 'agency', name: 'Agency Business', price: 49, interval: 'month' },
        { id: 'enterprise', name: 'Enterprise Scale', price: 199, interval: 'month' },
      ];
    }
  }

  @Get('subscription/:userId')
  @ApiOperation({ summary: 'Get subscription for a user' })
  async getSubscription(@Param('userId') userId: string) {
    return this.billingClient.getSubscription({ siteId: userId });
  }

  @Post('checkout/paystack')
  @ApiOperation({ summary: 'Initialize Paystack checkout' })
  async initializeCheckout(@Body() data: Record<string, unknown>) {
    return this.billingClient.initializeCheckout(data);
  }

  @Post('paystack/subaccount')
  @ApiOperation({ summary: 'Create a Paystack subaccount for a site' })
  async createSubaccount(@Body() data: Record<string, unknown>) {
    return this.billingClient.createSubaccount(data);
  }

  @Post('subscription/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  async cancelSubscription(@Body() data: { subscriptionId: string }) {
    return this.billingClient.cancelSubscription(data);
  }

  /** Public — called by Paystack. Forwards to billing-service via Redis. */
  @Public()
  @Post('webhook/paystack')
  @ApiOperation({ summary: 'Paystack webhook receiver' })
  async paystackWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // Verify signature at the gateway layer too, as a defence-in-depth measure.
    // The billing-service re-verifies before processing.
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (secret) {
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');
      if (hash !== signature) {
        return { status: 'rejected' };
      }
    }
    return this.billingClient.handleWebhook({ event: body.event, orderId: body.data?.reference, status: body.data?.status, raw: body });
  }
}

