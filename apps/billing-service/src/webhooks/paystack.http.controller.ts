// ─── billing-service/src/webhooks/paystack.http.controller.ts ────────────────
// HTTP controller exposing POST /billing/webhook/paystack
// This is separate from the main microservice transport (Redis) — the billing
// service runs BOTH a Redis microservice (for internal RPC) AND a small HTTP
// server for external webhooks. See billing main.ts for the healthApp pattern.
//
// Signature verification: Paystack signs every webhook with HMAC-SHA512 using
// your secret key. We verify before processing to prevent replay / spoofing attacks.

import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { PaystackWebhook } from './paystack.webhook';

@Controller('billing/webhook')
export class PaystackHttpController {
  private readonly logger = new Logger(PaystackHttpController.name);

  constructor(private readonly webhook: PaystackWebhook) {}

  @Post('paystack')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      this.logger.error('PAYSTACK_SECRET_KEY is not set — cannot verify webhook');
      return res.sendStatus(500);
    }

    // 1. Verify HMAC-SHA512 signature
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const signature = req.headers['x-paystack-signature'] as string;
    if (hash !== signature) {
      this.logger.warn('Paystack webhook signature mismatch — rejecting');
      return res.sendStatus(401);
    }

    // 2. Acknowledge immediately (Paystack retries if it doesn't get 200 quickly)
    res.sendStatus(200);

    // 3. Process the event asynchronously
    try {
      await this.webhook.process(req.body);
    } catch (err) {
      this.logger.error('Unhandled error processing Paystack webhook', err);
    }
  }
}
