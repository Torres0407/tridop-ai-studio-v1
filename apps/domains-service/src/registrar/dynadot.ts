import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynadotRegistrar {
  private readonly logger = new Logger(DynadotRegistrar.name);

  constructor(private configService: ConfigService) {}

  async register(domain: string, duration = 1) {
    const apiKey = this.configService.get<string>('DYNADOT_API_KEY');

    if (!apiKey) {
      this.logger.error('Dynadot credentials missing. Cannot register domain.');
      throw new Error('Dynadot integration not configured');
    }

    this.logger.log(`Registering ${domain} via Dynadot for ${duration} years`);

    // Dynadot uses a simple query string API
    const apiBase = this.configService.get<string>('DYNADOT_API_URL', 'https://api.dynadot.com/api3.json');
    const url = new URL(apiBase);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('command', 'register');
    url.searchParams.append('domain', domain);
    url.searchParams.append('duration', duration.toString());

    const res = await fetch(url.toString(), {
      method: 'GET',
    });

    const data = await res.json();
    if (data.RegisterResponse?.ResponseCode !== '0') {
      this.logger.error(`Dynadot API error: ${JSON.stringify(data)}`);
      throw new Error(`Dynadot registration failed: ${data.RegisterResponse?.Status || 'Unknown Error'}`);
    }

    return data.RegisterResponse;
  }
}
