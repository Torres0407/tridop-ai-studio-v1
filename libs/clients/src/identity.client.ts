// ─── libs/clients/src/identity.client.ts ────────────────────────────────────
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectClient } from './inject-client.decorator';
import { BaseServiceClient } from './baseClient';
import { AuthTokens, User, BusinessProfile } from '@libs/types';

// DTOs (inline here to avoid circular deps with identity-service src)
export interface SignupPayload { email: string; password: string; name?: string }
export interface LoginPayload { email: string; password: string }
export interface RefreshPayload { refreshToken: string }
export interface OAuthPayload { code: string; redirectUri: string }
export interface UpdateUserPayload { id: string; [key: string]: unknown }
export interface UpsertBusinessProfilePayload { userId: string; [key: string]: unknown }

export const IDENTITY_CLIENT = 'IDENTITY_SERVICE';

@Injectable()
export class IdentityClient extends BaseServiceClient {
  constructor(@InjectClient(IDENTITY_CLIENT) protected readonly proxy: ClientProxy) {
    super();
  }

  signup(payload: SignupPayload): Promise<AuthTokens> {
    return this.send('auth.signup', payload as unknown as Record<string, unknown>);
  }

  login(payload: LoginPayload): Promise<AuthTokens> {
    return this.send('auth.login', payload as unknown as Record<string, unknown>);
  }

  refresh(payload: RefreshPayload): Promise<AuthTokens> {
    return this.send('auth.refresh', payload as unknown as Record<string, unknown>);
  }

  logout(userId: string): Promise<void> {
    return this.send('auth.logout', { userId });
  }

  oauthGoogle(payload: OAuthPayload): Promise<AuthTokens> {
    return this.send('auth.oauth.google', payload as unknown as Record<string, unknown>);
  }

  oauthGithub(payload: OAuthPayload): Promise<AuthTokens> {
    return this.send('auth.oauth.github', payload as unknown as Record<string, unknown>);
  }

  findUserById(id: string): Promise<User> {
    return this.send('users.findById', { id });
  }

  updateUser(payload: UpdateUserPayload): Promise<User> {
    return this.send('users.update', payload);
  }

  deleteUser(id: string): Promise<void> {
    return this.send('users.delete', { id });
  }

  suspendUser(id: string): Promise<void> {
    return this.send('users.suspend', { id });
  }

  unsuspendUser(id: string): Promise<void> {
    return this.send('users.unsuspend', { id });
  }

  impersonateUser(id: string): Promise<AuthTokens> {
    return this.send('users.impersonate', { id });
  }

  getBusinessProfile(userId: string): Promise<BusinessProfile> {
    return this.send('businessProfile.get', { userId });
  }

  upsertBusinessProfile(payload: UpsertBusinessProfilePayload): Promise<BusinessProfile> {
    return this.send('businessProfile.upsert', payload);
  }

  listUsers(payload: { limit?: number; offset?: number }): Promise<any> {
    return this.send('users.list', payload);
  }
}
