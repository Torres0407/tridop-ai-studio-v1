import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareTransferJob {
  private readonly logger = new Logger(CloudflareTransferJob.name);

  constructor(private configService: ConfigService) {}

  async process(domain: string, authCode: string) {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');

    if (!accountId || !apiToken) {
      this.logger.error('Cloudflare credentials missing. Cannot initiate transfer.');
      throw new Error('Cloudflare integration not configured');
    }

    this.logger.log(`Initiating transfer to Cloudflare for ${domain}`);

    const apiBase = this.configService.get<string>('CLOUDFLARE_API_URL', 'https://api.cloudflare.com/client/v4');
    const res = await fetch(`${apiBase}/accounts/${accountId}/registrar/domains/${domain}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        auth_code: authCode,
        privacy: true,
        auto_renew: true
      }),
    });

    const data = await res.json();
    if (!data.success) {
      this.logger.error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
      throw new Error(`Cloudflare transfer failed: ${data.errors[0]?.message}`);
    }

    return data.result;
  }
}
