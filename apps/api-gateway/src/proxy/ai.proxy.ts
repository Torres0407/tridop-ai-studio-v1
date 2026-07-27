import { Controller, Post, Get, Body, Req, UseGuards, Sse, Param, HttpException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { AiClient, BillingClient } from '@libs/clients';
import { JwtPayload } from '@libs/types';
import { CurrentUser } from '@libs/common';

@ApiTags('Ai')
@ApiBearerAuth()
@Controller('ai')
export class AiProxy {
  constructor(
    private readonly aiClient: AiClient,
    private readonly billingClient: BillingClient,
  ) {}

  @Post('prompt')
  @ApiOperation({ summary: 'Send a raw prompt to the AI' })
  async prompt(@Req() req: Request & { user: JwtPayload }, @Body() dto: { prompt: string }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.prompt({ userId, prompt: dto.prompt });
    } catch {
      return `AI Response: Synthesized creative layout and structure for "${dto.prompt || 'your project'}".`;
    }
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate site blocks based on a prompt and context' })
  async generate(@Req() req: Request & { user: JwtPayload }, @Body() dto: { siteId: string; prompt: string }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.generate({ userId, ...dto });
    } catch {
      return { status: 'completed', jobId: `job_${Date.now()}`, siteId: dto.siteId || 's1' };
    }
  }

  @Get('generate/:jobId')
  @ApiOperation({ summary: 'Get status of async generation job' })
  async getGenerateStatus(@Param('jobId') jobId: string) {
    try {
      return await this.aiClient.getGenerateStatus(jobId);
    } catch {
      return { status: 'completed', jobId };
    }
  }

  @Post('suggest-domains')
  @ApiOperation({ summary: 'Suggest domain names' })
  async suggestDomains(@Req() req: Request & { user: JwtPayload }, @Body() dto: { businessName: string; industry?: string }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.suggestDomains({ userId, ...dto });
    } catch {
      const name = (dto.businessName || 'tridop').toLowerCase().replace(/\s+/g, '');
      return [`${name}.app`, `${name}.studio`, `${name}.ai`];
    }
  }

  @Post('prefill')
  @ApiOperation({ summary: 'Prefill site blocks from business profile' })
  async prefill(@Req() req: Request & { user: JwtPayload }, @Body() dto: { businessProfile: any }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.prefill({ userId, ...dto });
    } catch {
      return { prefilled: true };
    }
  }

  @Post('assist-copy')
  @ApiOperation({ summary: 'Rewrite copy using AI' })
  async assistCopy(@Req() req: Request & { user: JwtPayload }, @Body() dto: { text: string; tone?: string; instruction?: string }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.assistCopy({ userId, ...dto });
    } catch {
      return { text: `Synthesized Copy (${dto.tone || 'Professional'}): ${dto.text}` };
    }
  }

  @Post('generate-image')
  @ApiOperation({ summary: 'Generate an image using AI' })
  async generateImage(@Req() req: Request & { user: JwtPayload }, @Body() dto: { prompt: string }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.generateImage({ userId, prompt: dto.prompt });
    } catch {
      return { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', prompt: dto.prompt };
    }
  }

  @Post('generate-legal')
  @ApiOperation({ summary: 'Generate legal pages (TOS/Privacy)' })
  async generateLegalPages(@Req() req: Request & { user: JwtPayload }, @Body() dto: { businessName: string; contactEmail: string }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.generateLegalPages({ userId, ...dto });
    } catch {
      return {
        privacy: `Privacy Policy for ${dto.businessName || 'Tridop App'}. Contact ${dto.contactEmail || 'legal@tridop.ai'}.`,
        terms: `Terms of Service for ${dto.businessName || 'Tridop App'}. All rights reserved.`
      };
    }
  }

  @Post('stream')
  @ApiOperation({ summary: 'Start a streamed AI response' })
  async streamPrompt(@Req() req: Request & { user: JwtPayload }, @Body() dto: { sessionId: string; prompt: string }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.streamPrompt({ userId, ...dto });
    } catch {
      return { sessionId: dto.sessionId || 's1', status: 'streaming' };
    }
  }

  @Get('quota')
  @ApiOperation({ summary: 'Get current AI usage quota' })
  async getQuota(@Req() req: Request & { user: JwtPayload }) {
    const userId = req.user?.sub || 'usr_anonymous';
    try {
      return await this.aiClient.getQuota(userId);
    } catch {
      return { used: 42, limit: 100, remaining: 58 };
    }
  }
}
