// ─── api-gateway/src/sse/promptStream.gateway.ts ────────────────────────────
// Relays ai-service Redis pub/sub → client SSE stream.
// Each user's streaming response arrives on channel `ai:stream:{userId}`.

import { Controller, Get, Req, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { JwtPayload } from '@libs/types';

@ApiTags('SSE')
@ApiBearerAuth()
@Controller('ai')
export class PromptStreamGateway {
  private readonly logger = new Logger(PromptStreamGateway.name);

  @Get('stream')
  stream(@Req() req: Request & { user: JwtPayload }, @Res() res: Response) {
    const userId = req.user.sub;
    const channel = `ai:stream:${userId}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    subscriber.subscribe(channel);

    subscriber.on('message', (_ch, message) => {
      res.write(`data: ${message}\n\n`);
    });

    // Heartbeat every 15 s to keep connection alive through proxies
    const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 15_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe(channel);
      subscriber.quit();
      this.logger.log({ userId, event: 'sse.disconnect', channel });
    });
  }
}
