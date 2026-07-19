// ─── api-gateway/src/proxy/identity.proxy.ts ────────────────────────────────
// HTTP controllers that forward to identity-service via IdentityClient.
// The ONLY place in the codebase that has @Get/@Post for auth routes.

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import {
  IdentityClient,
  SignupPayload,
  LoginPayload,
  RefreshPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@libs/clients';
import { CurrentUser, Public } from '@libs/common';
import { JwtPayload, BUSINESS_CATEGORIES } from '@libs/types';

@ApiTags('Auth')
@Controller('auth')
export class AuthProxy {
  constructor(private readonly identity: IdentityClient) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  signup(@Body() dto: SignupPayload) {
    return this.identity.signup(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  login(@Body() dto: LoginPayload) {
    return this.identity.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate JWT access token using refresh token' })
  refresh(@Body() dto: RefreshPayload) {
    return this.identity.refresh(dto);
  }

  @Delete('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate all sessions for the current user' })
  logout(@Req() req: Request & { user: JwtPayload }, @Body() body: { refreshToken?: string }) {
    return this.identity.logout(req.user.sub, body?.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordPayload) {
    return this.identity.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using the token from the email link' })
  resetPassword(@Body() dto: ResetPasswordPayload) {
    return this.identity.resetPassword(dto);
  }
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersProxy {
  constructor(private readonly identity: IdentityClient) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Req() req: Request & { user: JwtPayload }) {
    return this.identity.findUserById(req.user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@Req() req: Request & { user: JwtPayload }, @Body() dto: Record<string, unknown>) {
    return this.identity.updateUser({ id: req.user.sub, ...dto });
  }

  @Get('me/business-profile')
  @ApiOperation({ summary: 'Get business profile for the current user' })
  getProfile(@Req() req: Request & { user: JwtPayload }) {
    return this.identity.getBusinessProfile(req.user.sub);
  }

  @Post('me/business-profile')
  @ApiOperation({ summary: 'Create or update business profile' })
  upsertProfile(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: Record<string, unknown>,
  ) {
    return this.identity.upsertBusinessProfile({ userId: req.user.sub, ...dto });
  }
}

@ApiTags('Categories')
@Controller('categories')
export class CategoriesProxy {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get available business categories and their default features' })
  getCategories() {
    return BUSINESS_CATEGORIES;
  }
}
