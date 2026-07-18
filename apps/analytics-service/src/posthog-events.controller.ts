import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

@ApiTags('Analytics')
@Controller('events')
export class PostHogEventsController {
  private posthog: PostHog | null = null;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('POSTHOG_API_KEY');
    if (key) {
      this.posthog = new PostHog(key, { host: 'https://app.posthog.com' });
    }
  }
  
  @Post()
  @ApiOperation({ summary: 'Log an analytics event' })
  async logEvent(@Body() data: { event: string, properties: any, distinctId?: string }) {
    if (this.posthog) {
      this.posthog.capture({
        distinctId: data.distinctId || 'anonymous',
        event: data.event,
        properties: data.properties,
      });
      // Await flush in real implementations or just rely on async batching
      await this.posthog.flush();
    } else {
      console.warn(`[PostHog] Event logged but POSTHOG_API_KEY is missing: ${data.event}`);
    }
    return { success: true };
  }
}
