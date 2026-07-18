import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: '/auth/oauth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<void> {
    const { id, emails, username } = profile;
    const user = {
      oauthId: String(id),
      email: emails?.[0]?.value ?? `${username}@github.noreply`,
      displayName: username,
      oauthProvider: 'github' as const,
    };
    done(null, user);
  }
}
