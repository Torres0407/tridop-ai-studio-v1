// ─── api-gateway/src/proxy/billing.proxy.ts ──────────────────────────────────
// STUB — HTTP controllers for billing-service will be implemented in the
// corresponding build phase. Until then these are registered but return 503.
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingClient } from '@libs/clients';
import { SiteOwnershipGuard } from '@libs/common';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(SiteOwnershipGuard)
export class BillingProxy {
  constructor(private readonly billingClient: BillingClient) {}

  @Get('plans')
  @ApiOperation({ summary: 'List all subscription plans' })
  async listPlans() {
    return this.billingClient.listPlans();
  }

  @Get('subscription/:siteId')
  @ApiOperation({ summary: 'Get subscription for a site' })
  async getSubscription(@Param('siteId') siteId: string) {
    return this.billingClient.getSubscription({ siteId });
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
}
