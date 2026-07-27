import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticateJWTMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next(); return; // Proceed without user context (guarded routes will fail via @UseGuards)
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || process.env.JWT_ACCESS_SECRET || 'tridop-jwt-secret-key-2026';
      const payload = jwt.verify(token, secret);
      // Attach user payload to request
      req.user = payload;
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
