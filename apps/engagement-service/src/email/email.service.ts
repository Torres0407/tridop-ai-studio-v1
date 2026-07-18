import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {}

  async sendEmail(to: string, subject: string, body: string) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not set');
      throw new Error('Email integration is not configured');
    }

    this.logger.log(`Sending email via Resend to ${to}`);
    
    const apiUrl = this.config.get<string>('RESEND_API_URL', 'https://api.resend.com/emails');
    const fromEmail = this.config.get<string>('EMAIL_FROM', 'TridopAI <noreply@tridop.ai>');

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html: body,
      }),
    });

    const data = (await res.json()) as any;
    if (!res.ok) {
      this.logger.error(`Resend API error: ${JSON.stringify(data)}`);
      throw new Error(`Failed to send email: ${data.message || res.statusText}`);
    }

    return { status: 'sent', id: data.id };
  }
}
