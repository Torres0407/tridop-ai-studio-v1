import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { UserEntity } from '../entities/user.entity';
import { SignupDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { AuthTokens } from '@libs/types';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async signTokens(userId: string, email: string, role: string = 'user'): Promise<AuthTokens> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    
    if (!accessSecret || !refreshSecret) throw new Error('JWT Secrets missing');

    const accessToken = jwt.sign({ sub: userId, email, role }, accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: userId }, refreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async signup(dto: SignupDto): Promise<AuthTokens> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await this.hashPassword(dto.password);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      oauthProvider: 'local'
    });

    await this.userRepo.save(user);
    return this.signTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userRepo.findOne({ 
      where: { email: dto.email },
      select: {
        id: true,
        passwordHash: true,
        role: true,
        isSuspended: true
      }
    });
    
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isSuspended) {
      throw new UnauthorizedException('Account suspended');
    }

    const isValid = await this.comparePassword(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Reload with email for token
    const fullUser = await this.userRepo.findOne({ where: { id: user.id } });
    return this.signTokens(user.id, fullUser!.email, user.role);
  }

  async refresh(dto: RefreshDto): Promise<AuthTokens> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) throw new Error('JWT Secrets missing');

    try {
      const payload = jwt.verify(dto.refreshToken, refreshSecret) as any;
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.isSuspended) throw new UnauthorizedException();
      return this.signTokens(user.id, user.email, user.role);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    // Blacklist the refresh token in Redis for the remainder of its 7-day TTL
    if (refreshToken) {
      const Redis = require('ioredis');
      const redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
      await redis.setex(`token:blacklist:${refreshToken}`, 7 * 24 * 60 * 60, userId);
      await redis.quit();
    }
  }

  private getMailTransport() {
    return nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Always return the same message to prevent user enumeration
    const user = await this.userRepo.findOne({ where: { email } });
    const message = 'If an account with that email exists, a reset link has been sent.';

    if (!user) return { message };

    // Generate a secure random token and store it in Redis for 15 minutes
    const token = crypto.randomBytes(32).toString('hex');
    const Redis = require('ioredis');
    const redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
    await redis.setex(`password_reset:${token}`, 15 * 60, user.id);
    await redis.quit();

    const appUrl = this.configService.get<string>('APP_FRONTEND_URL', 'https://app.tridop.ai');
    const resetLink = `${appUrl}/reset-password/${token}`;

    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'TridopAI');
    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL', this.configService.get<string>('SMTP_USER', 'no-reply@tridop.ai'));

    try {
      const transport = this.getMailTransport();
      await transport.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Reset your TridopAI password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset the password for your TridopAI account.</p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
            <p style="margin-top:16px;font-size:13px;color:#6b7280">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (e) {
      // Log but don't throw — don't reveal email delivery errors to callers
      console.error('[Auth] Failed to send password reset email:', e);
    }

    return { message };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const Redis = require('ioredis');
    const redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
    const key = `password_reset:${token}`;
    const userId = await redis.get(key);

    if (!userId) {
      await redis.quit();
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      await redis.del(key);
      await redis.quit();
      throw new BadRequestException('User not found.');
    }

    // Block OAuth-only users from setting a local password via reset flow
    if (user.oauthProvider !== 'local') {
      await redis.del(key);
      await redis.quit();
      throw new BadRequestException(`This account uses ${user.oauthProvider} login. Password reset is not available.`);
    }

    user.passwordHash = await this.hashPassword(newPassword);
    await this.userRepo.save(user);
    // Invalidate the token so it can't be reused
    await redis.del(key);
    await redis.quit();

    return { message: 'Password has been reset successfully. You may now log in.' };
  }

  async oauthGoogle(code: string, redirectUri: string): Promise<AuthTokens> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new Error('Google OAuth credentials missing');

    // 1. Exchange code for tokens
    const oauthUrl = this.configService.get<string>('GOOGLE_OAUTH_URL', 'https://oauth2.googleapis.com/token');
    const tokenRes = await fetch(oauthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = (await tokenRes.json()) as any;
    if (tokenData.error) throw new UnauthorizedException(tokenData.error_description);

    // 2. Get user info
    const userInfoUrl = this.configService.get<string>('GOOGLE_USERINFO_URL', 'https://www.googleapis.com/oauth2/v2/userinfo');
    const userRes = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = (await userRes.json()) as any;
    if (!userData.email) throw new UnauthorizedException('No email returned from Google');

    // 3. Upsert user
    let user: any = null;
    try {
      user = await this.userRepo.findOne({ where: { email: userData.email } });
      if (!user) {
        user = this.userRepo.create({
          email: userData.email,
          oauthProvider: 'google',
          oauthId: userData.id,
        });
        await this.userRepo.save(user);
      }
    } catch {
      user = {
        id: 'usr_' + Date.now(),
        email: userData.email,
        role: 'user',
        oauthProvider: 'google',
      };
    }

    return this.signTokens(user.id, user.email, user.role);
  }

  async oauthGithub(code: string, redirectUri: string): Promise<AuthTokens> {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new Error('GitHub OAuth credentials missing');

    // 1. Exchange code for token
    const oauthUrl = this.configService.get<string>('GITHUB_OAUTH_URL', 'https://github.com/login/oauth/access_token');
    const tokenRes = await fetch(oauthUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = (await tokenRes.json()) as any;
    if (tokenData.error) throw new UnauthorizedException(tokenData.error_description);

    // 2. Get user info
    const userInfoUrl = this.configService.get<string>('GITHUB_USERINFO_URL', 'https://api.github.com/user');
    const userRes = await fetch(userInfoUrl, {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
    });
    const userData = (await userRes.json()) as any;
    
    // 3. GitHub emails might be private, fetch separately if needed
    let email = userData.email;
    if (!email) {
      const emailUrl = this.configService.get<string>('GITHUB_EMAILS_URL', 'https://api.github.com/user/emails');
      const emailRes = await fetch(emailUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = (await emailRes.json()) as any;
      email = emails?.find?.((e: any) => e.primary)?.email || emails?.[0]?.email || `${userData.login}@github.com`;
    }
    if (!email) throw new UnauthorizedException('No email available from GitHub');

    // 4. Upsert user
    let user: any = null;
    try {
      user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        user = this.userRepo.create({
          email,
          oauthProvider: 'github',
          oauthId: userData.id.toString(),
        });
        await this.userRepo.save(user);
      }
    } catch {
      user = {
        id: 'usr_' + Date.now(),
        email,
        role: 'user',
        oauthProvider: 'github',
      };
    }

    return this.signTokens(user.id, email, user.role);
  }
}
