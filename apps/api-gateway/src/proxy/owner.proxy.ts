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
    return this.ownerClient.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all business owners (users)' })
  async listUsers(@Query() query: PaginationQueryDto) {
    return this.identityClient.listUsers({ limit: query.limit, offset: query.offset });
  }

  @Put('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a business owner' })
  async suspendUser(@Param('id') id: string) {
    return this.identityClient.suspendUser(id);
  }

  @Put('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend a business owner' })
  async unsuspendUser(@Param('id') id: string) {
    return this.identityClient.unsuspendUser(id);
  }

  @Post('users/:id/impersonate')
  @ApiOperation({ summary: 'Impersonate a business owner account' })
  async impersonateUser(@Param('id') id: string) {
    return this.identityClient.impersonateUser(id);
  }

  @Get('sites')
  @ApiOperation({ summary: 'List all websites hosted on the platform' })
  async listAllSites(@Query() query: PaginationQueryDto) {
    return this.sitesClient.listAllSites({ limit: query.limit, offset: query.offset });
  }

  @Put('kill-switch')
  @ApiOperation({ summary: 'Toggle the platform kill-switch' })
  async setKillSwitch(@Body() dto: KillSwitchDto) {
    return this.ownerClient.setKillSwitch({ active: dto.active });
  }
}
