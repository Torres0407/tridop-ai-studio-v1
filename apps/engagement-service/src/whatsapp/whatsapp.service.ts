import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private configService: ConfigService) {}

  async send(to: string, message: string) {
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const token = this.configService.get<string>('WHATSAPP_API_TOKEN');

    if (!phoneNumberId || !token) {
      this.logger.error('WHATSAPP credentials missing');
      throw new Error('WhatsApp integration not configured');
    }

    this.logger.log(`Sending WhatsApp message to ${to}`);

    const apiBase = this.configService.get<string>('WHATSAPP_API_URL', 'https://graph.facebook.com/v17.0');
    const res = await fetch(`${apiBase}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      this.logger.error(`WhatsApp API error: ${JSON.stringify(data)}`);
      throw new Error(`WhatsApp send failed: ${data.error?.message || res.statusText}`);
    }

    return data;
  }
}
