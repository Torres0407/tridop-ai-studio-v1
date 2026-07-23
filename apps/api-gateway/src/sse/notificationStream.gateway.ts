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
    const channel = `engagement:notifications:${req.user.sub}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    subscriber.on('error', () => {});
    subscriber.subscribe(channel);

    subscriber.on('message', (_ch, message) => res.write(`data: ${message}\n\n`));

    const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 15_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe(channel);
      subscriber.quit();
    });
  }
}
