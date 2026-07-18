import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappWebhook {
  async process() { return true; }
}
