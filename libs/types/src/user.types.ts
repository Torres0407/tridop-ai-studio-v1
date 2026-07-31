// ─── libs/types/src/user.types.ts ───────────────────────────────────────────

export type UserRole = 'user' | 'owner' | 'admin';
export type OAuthProvider = 'google' | 'github' | 'local';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  oauthProvider: OAuthProvider;
  oauthId?: string;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface BusinessProfile {
  userId: string;
  businessName: string;
  category?: string;
  industry?: string;
  description?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  websiteUrl?: string;
  selectedFeatures?: string[];
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
