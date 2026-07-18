import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpaceshipRegistrar {
  private readonly logger = new Logger(SpaceshipRegistrar.name);

  constructor(private configService: ConfigService) {}

  async register(domain: string) {
    const apiKey = this.configService.get<string>('SPACESHIP_API_KEY');
    const apiUser = this.configService.get<string>('SPACESHIP_API_USER');

    if (!apiKey || !apiUser) {
      this.logger.error('Spaceship credentials missing. Cannot register domain.');
      throw new Error('Spaceship integration not configured');
    }

    this.logger.log(`Registering ${domain} via Spaceship`);

    const apiUrl = this.configService.get<string>('SPACESHIP_API_URL', 'https://spaceship.dev/api/v1/domains');
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-User': apiUser,
      },
      body: JSON.stringify({
        domainName: domain,
        years: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Spaceship API error: ${err}`);
      throw new Error(`Spaceship registration failed: ${res.statusText}`);
    }

    return await res.json();
  }
}
