// ─── api-gateway/src/sse/notificationStream.gateway.ts ──────────────────────
import { Controller, Get, Req, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { JwtPayload } from '@libs/types';

@ApiTags('SSE')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationStreamGateway {
  private readonly logger = new Logger(NotificationStreamGateway.name);

  @Get('stream')
  stream(@Req() req: Request & { user: JwtPayload }, @Res() res: Response) {
    const userId = req.user?.sub || 'usr_anonymous';
    const channel = `engagement:notifications:${userId}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy: () => null,
      });
      subscriber.on('error', () => {});
      subscriber.connect().then(() => subscriber.subscribe(channel)).catch(() => {});
      subscriber.on('message', (_ch, message) => res.write(`data: ${message}\n\n`));

      const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 15_000);

      req.on('close', () => {
        clearInterval(heartbeat);
        subscriber.unsubscribe(channel).catch(() => {});
        subscriber.quit().catch(() => {});
      });
    } catch {
      const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 15_000);
      req.on('close', () => clearInterval(heartbeat));
    }
  }
}
