// ─── auth.controller.ts ──────────────────────────────────────────────────────
// ALL handlers are @MessagePattern — NO @Get/@Post here.
// This is a Redis microservice; HTTP is handled by api-gateway only.

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, RefreshDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { AuthTokens } from '@libs/types';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.signup')
  signup(@Payload() dto: SignupDto): Promise<AuthTokens> {
    return this.authService.signup(dto);
  }

  @MessagePattern('auth.login')
  login(@Payload() dto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(dto);
  }

  @MessagePattern('auth.refresh')
  refresh(@Payload() dto: RefreshDto): Promise<AuthTokens> {
    return this.authService.refresh(dto);
  }

  @MessagePattern('auth.logout')
  logout(@Payload() data: { userId: string; refreshToken?: string }): Promise<void> {
    return this.authService.logout(data.userId, data.refreshToken);
  }

  @MessagePattern('auth.forgotPassword')
  forgotPassword(@Payload() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }

  @MessagePattern('auth.resetPassword')
  resetPassword(@Payload() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  // OAuth handlers — exchange auth code for tokens
  // The OAuth code exchange happens inside identity-service (Passport strategies);
  // api-gateway redirects the browser, then calls these patterns with the code.
  @MessagePattern('auth.oauth.google')
  oauthGoogle(@Payload() payload: { code: string; redirectUri: string }): Promise<AuthTokens> {
    return this.authService.oauthGoogle(payload.code, payload.redirectUri);
  }

  @MessagePattern('auth.oauth.github')
  oauthGithub(@Payload() payload: { code: string; redirectUri: string }): Promise<AuthTokens> {
    return this.authService.oauthGithub(payload.code, payload.redirectUri);
  }
}
