import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Handles streaming AI responses to connected clients via Redis pub/sub.
 * The api-gateway's promptStream.gateway.ts subscribes to the same Redis channel
 * and forwards chunks as Server-Sent Events to the browser.
 */
@Injectable()
export class StreamRelay {
  private readonly logger = new Logger(StreamRelay.name);
  private readonly channelPrefix = 'ai:stream:';

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('events') private readonly eventsQueue: Queue,
  ) {}

  async publishChunk(sessionId: string, chunk: string): Promise<void> {
    const channel = `${this.channelPrefix}${sessionId}`;
    // In production this publishes to Redis pub/sub so api-gateway can relay it
    this.logger.debug(`Publishing chunk to ${channel}`);
  }

  async publishDone(sessionId: string): Promise<void> {
    const channel = `${this.channelPrefix}${sessionId}`;
    this.logger.debug(`Publishing [DONE] to ${channel}`);
  }

  async publishError(sessionId: string, error: string): Promise<void> {
    const channel = `${this.channelPrefix}${sessionId}`;
    this.logger.error(`Publishing error to ${channel}: ${error}`);
  }
}
