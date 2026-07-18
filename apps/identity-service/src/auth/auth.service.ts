import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
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

  async signTokens(userId: string, role: string = 'user'): Promise<AuthTokens> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    
    if (!accessSecret || !refreshSecret) throw new Error('JWT Secrets missing');

    const accessToken = jwt.sign({ sub: userId, role }, accessSecret, { expiresIn: '15m' });
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
    return this.signTokens(user.id, user.role);
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

    return this.signTokens(user.id, user.role);
  }

  async refresh(dto: RefreshDto): Promise<AuthTokens> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) throw new Error('JWT Secrets missing');

    try {
      const payload = jwt.verify(dto.refreshToken, refreshSecret) as any;
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.isSuspended) throw new UnauthorizedException();
      return this.signTokens(user.id, user.role);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a stateless JWT system, true logout requires a blacklist, 
    // but typically we rely on token expiry and frontend clearance.
    return;
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
    let user = await this.userRepo.findOne({ where: { email: userData.email } });
    if (!user) {
      user = this.userRepo.create({
        email: userData.email,
        oauthProvider: 'google',
        oauthId: userData.id,
      });
      await this.userRepo.save(user);
    }

    return this.signTokens(user.id, user.role);
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
      email = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
    }
    if (!email) throw new UnauthorizedException('No email available from GitHub');

    // 4. Upsert user
    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      user = this.userRepo.create({
        email,
        oauthProvider: 'github',
        oauthId: userData.id.toString(),
      });
      await this.userRepo.save(user);
    }

    return this.signTokens(user.id, user.role);
  }
}
