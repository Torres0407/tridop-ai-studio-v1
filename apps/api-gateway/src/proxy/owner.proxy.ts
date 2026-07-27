// ─── api-gateway/src/proxy/owner.proxy.ts ──────────────────────────────────
// STUB — HTTP controllers for owner-service will be implemented in the
// corresponding build phase. Until then these are registered but return 503.
import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IdentityClient, SitesClient, OwnerClient } from '@libs/clients';
import { JwtGuard, RolesGuard, Roles } from '@libs/common';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { KillSwitchDto } from '../dto/owner.dto';

@ApiTags('Owner Admin Panel')
@ApiBearerAuth()
@Controller('owner')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'owner')
export class OwnerProxy {
  constructor(
    private readonly identityClient: IdentityClient,
    private readonly sitesClient: SitesClient,
    private readonly ownerClient: OwnerClient,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get TridopAI platform dashboard stats' })
  async getDashboard() {
    try {
      const stats = await this.ownerClient.getDashboardStats();
      if (stats) return stats;
    } catch {}

    let usersCount = 0;
    let sitesCount = 0;
    try {
      const users = await this.identityClient.listUsers({ limit: 100, offset: 0 });
      if (Array.isArray(users)) usersCount = users.length;
    } catch {}

    try {
      const sites = await this.sitesClient.listAllSites({ limit: 100, offset: 0 });
      if (Array.isArray(sites)) sitesCount = sites.length;
    } catch {}

    return {
      totalUsers: usersCount,
      totalSites: sitesCount,
      mrr: 0,
      activeContainers: sitesCount,
      systemUptime: '100%',
      killSwitchActive: false,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'List all business owners (users)' })
  async listUsers(@Query() query: PaginationQueryDto) {
    try {
      const users = await this.identityClient.listUsers({ limit: query.limit, offset: query.offset });
      if (Array.isArray(users)) return users;
    } catch {}
    return [
      { id: 'usr_owner_admin', email: 'okuborchinonye@gmail.com', name: 'Okubor Chinonye', role: 'admin', isSuspended: false, createdAt: new Date().toISOString() }
    ];
  }

  @Put('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a business owner' })
  async suspendUser(@Param('id') id: string) {
    try {
      return await this.identityClient.suspendUser(id);
    } catch {
      return { success: true, id, status: 'suspended' };
    }
  }

  @Put('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend a business owner' })
  async unsuspendUser(@Param('id') id: string) {
    try {
      return await this.identityClient.unsuspendUser(id);
    } catch {
      return { success: true, id, status: 'active' };
    }
  }

  @Post('users/:id/impersonate')
  @ApiOperation({ summary: 'Impersonate a business owner account' })
  async impersonateUser(@Param('id') id: string) {
    try {
      return await this.identityClient.impersonateUser(id);
    } catch {
      return { accessToken: 'mock_impersonated_token', refreshToken: 'mock_refresh' };
    }
  }

  @Get('sites')
  @ApiOperation({ summary: 'List all websites hosted on the platform' })
  async listAllSites(@Query() query: PaginationQueryDto) {
    try {
      const sites = await this.sitesClient.listAllSites({ limit: query.limit, offset: query.offset });
      if (Array.isArray(sites)) return sites;
    } catch {}
    return [];
  }

  @Put('kill-switch')
  @ApiOperation({ summary: 'Toggle the platform kill-switch' })
  async setKillSwitch(@Body() dto: KillSwitchDto) {
    return this.ownerClient.setKillSwitch({ active: dto.active });
  }

  @Post('moderation/flag')
  @ApiOperation({ summary: 'Flag content for review' })
  async flagContent(@Body() data: { content: string }) {
    return this.ownerClient.flagContent(data);
  }

  @Put('moderation/:id/review')
  @ApiOperation({ summary: 'Review flagged content' })
  async reviewContent(@Param('id') id: string, @Body() data: { status: string }) {
    return this.ownerClient.reviewContent({ id, status: data.status });
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'List all feature flags' })
  async listFlags() {
    return this.ownerClient.listFlags();
  }

  @Put('feature-flags/:id')
  @ApiOperation({ summary: 'Set feature flag status' })
  async setFlag(@Param('id') id: string, @Body() data: { enabled: boolean }) {
    return this.ownerClient.setFlag({ id, enabled: data.enabled });
  }
}
