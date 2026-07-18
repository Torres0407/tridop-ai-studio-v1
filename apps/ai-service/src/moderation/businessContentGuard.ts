import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BusinessContentGuard {
  constructor(@InjectQueue('events') private eventsQueue: Queue) {}

  async checkContent(content: string) {
    // Flag content logic
    const isSafe = true;
    if (!isSafe) {
      await this.eventsQueue.add('CONTENT_FLAGGED', { content });
      throw new Error('Content flagged by moderation guard');
    }
    return isSafe;
  }
}
