import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly username: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.username = config.get<string>('AFRICASTALKING_USERNAME', 'sandbox');
    this.apiKey = config.get<string>('AFRICASTALKING_API_KEY', '');
  }

  async send(to: string, message: string): Promise<{ status: string; messageId?: string }> {
    if (!this.apiKey) {
      this.logger.error('AFRICASTALKING_API_KEY not set');
      throw new Error('SMS integration is not configured');
    }

    try {
      // AfricasTalking REST API
      const apiUrl = this.config.get<string>('AFRICASTALKING_API_URL', 'https://api.africastalking.com/version1/messaging');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          apiKey: this.apiKey,
        },
        body: new URLSearchParams({
          username: this.username,
          to,
          message,
        }).toString(),
      });

      const data: any = await response.json();
      const recipient = data?.SMSMessageData?.Recipients?.[0];

      this.logger.log(`SMS sent to ${to}: ${recipient?.status}`);
      return { status: recipient?.status ?? 'sent', messageId: recipient?.messageId };
    } catch (err) {
      this.logger.error(`Failed to send SMS to ${to}`, err);
      throw err;
    }
  }
}
