import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { DomainsClient } from '@libs/clients';
import { JwtPayload } from '@libs/types';

@ApiTags('Domains')
@ApiBearerAuth()
@Controller('domains')
export class DomainsProxy {
  constructor(private readonly domainsClient: DomainsClient) {}

  @Post('search')
  @ApiOperation({ summary: 'Search for a domain' })
  async searchDomain(@Body() data: { query: string }) {
    return this.domainsClient.search(data.query);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a domain' })
  async registerDomain(@Req() req: Request & { user: JwtPayload }, @Body() data: any) {
    return this.domainsClient.register({ userId: req.user.sub, ...data });
  }

  @Get('site/:siteId')
  @ApiOperation({ summary: 'List domains for a site' })
  async listDomains(@Param('siteId') siteId: string) {
    return this.domainsClient.listDomains({ siteId });
  }
}
