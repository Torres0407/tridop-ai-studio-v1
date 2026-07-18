// ─── api-gateway/src/sse/deployStream.gateway.ts ────────────────────────────
import { Controller, Get, Param, Req, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { JwtPayload } from '@libs/types';

@ApiTags('SSE')
@ApiBearerAuth()
@Controller('deploy')
export class DeployStreamGateway {
  private readonly logger = new Logger(DeployStreamGateway.name);

  @Get(':jobId/stream')
  stream(
    @Param('jobId') jobId: string,
    @Req() req: Request & { user: JwtPayload },
    @Res() res: Response,
  ) {
    const channel = `deploy:stream:${jobId}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
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
