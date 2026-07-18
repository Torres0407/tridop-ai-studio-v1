// ─── libs/common/src/guards/jwt.guard.ts ────────────────────────────────────
// Shared JWT verification logic used by api-gateway's authenticateJWT middleware.
// Q2 decision: HS256 (shared secret). Can be upgraded to RS256 by swapping
// the algorithm here and providing public key via JWT_ACCESS_PUBLIC_KEY env var.
//
// Does NOT call identity-service — verifies locally with the shared secret.

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('No auth token');

    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as any;
      
      // Check suspension in Redis
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
      const isSuspended = await redis.get(`user:suspended:${payload.sub}`);
      await redis.quit();

      if (isSuspended === 'true') {
        throw new UnauthorizedException('Account is suspended');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: { headers: Record<string, string> }): string | null {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }
}

/** Decorator to mark a route as publicly accessible (no JWT required). */
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
