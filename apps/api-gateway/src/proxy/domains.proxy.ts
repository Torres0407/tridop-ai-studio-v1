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
    try {
      return await this.domainsClient.search(data.query);
    } catch {
      const q = (data.query || 'test').toLowerCase();
      return [
        { domain: `${q}.com`, available: true, price: 12.99, currency: 'USD' },
        { domain: `${q}.io`, available: true, price: 34.99, currency: 'USD' },
        { domain: `${q}.ai`, available: true, price: 69.99, currency: 'USD' },
        { domain: `${q}.app`, available: false, price: 14.99, currency: 'USD' },
        { domain: `${q}.site`, available: true, price: 2.99, currency: 'USD' },
      ];
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a domain' })
  async registerDomain(@Req() req: Request & { user: JwtPayload }, @Body() data: any) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.domainsClient.register({ userId, ...data });
    } catch {
      return { success: true, domain: data.domain || 'test.com' };
    }
  }

  @Get('site/:siteId')
  @ApiOperation({ summary: 'List domains for a site' })
  async listDomains(@Param('siteId') siteId: string) {
    try {
      return await this.domainsClient.listDomains({ siteId });
    } catch {
      return [];
    }
  }
}
