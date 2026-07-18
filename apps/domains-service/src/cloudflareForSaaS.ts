import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareForSaaS {
  private readonly logger = new Logger(CloudflareForSaaS.name);

  constructor(private configService: ConfigService) {}

  async provisionHostname(domain: string) {
    const zoneId = this.configService.get<string>('CLOUDFLARE_ZONE_ID');
    const apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');

    if (!zoneId || !apiToken) {
      this.logger.error('Cloudflare credentials missing. Cannot provision hostname.');
      throw new Error('Cloudflare integration not configured');
    }

    this.logger.log(`Provisioning custom hostname for ${domain}`);

    const apiBase = this.configService.get<string>('CLOUDFLARE_API_URL', 'https://api.cloudflare.com/client/v4');
    const res = await fetch(`${apiBase}/zones/${zoneId}/custom_hostnames`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        hostname: domain,
        ssl: {
          method: 'txt',
          type: 'dv',
        },
      }),
    });

    const data = await res.json();
    if (!data.success) {
      this.logger.error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
      throw new Error(`Cloudflare provisioning failed: ${data.errors[0]?.message}`);
    }

    return data.result;
  }
}
