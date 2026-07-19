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
  prompt(@Req() req: Request & { user: JwtPayload }, @Body() dto: { prompt: string }) {
    return this.aiClient.prompt({ userId: req.user.sub, prompt: dto.prompt });
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate site blocks based on a prompt and context' })
  async generate(@Req() req: Request & { user: JwtPayload }, @Body() dto: { siteId: string; prompt: string }) {
    // Deduct AI credits via public wrapper
    const result = await this.billingClient.deductCredits({ userId: req.user.sub, amount: 1 });
    if (!result?.success) {
      throw new HttpException('Payment Required - Insufficient AI Credits', 402);
    }
    
    return this.aiClient.generate({ userId: req.user.sub, ...dto });
  }

  @Get('generate/:jobId')
  @ApiOperation({ summary: 'Get status of async generation job' })
  getGenerateStatus(@Param('jobId') jobId: string) {
    return this.aiClient.getGenerateStatus(jobId);
  }

  @Post('suggest-domains')
  @ApiOperation({ summary: 'Suggest domain names' })
  suggestDomains(@Req() req: Request & { user: JwtPayload }, @Body() dto: { businessName: string; industry?: string }) {
    return this.aiClient.suggestDomains({ userId: req.user.sub, ...dto });
  }

  @Post('prefill')
  @ApiOperation({ summary: 'Prefill site blocks from business profile' })
  prefill(@Req() req: Request & { user: JwtPayload }, @Body() dto: { businessProfile: any }) {
    return this.aiClient.prefill({ userId: req.user.sub, ...dto });
  }

  @Post('assist-copy')
  @ApiOperation({ summary: 'Rewrite copy using AI' })
  assistCopy(@Req() req: Request & { user: JwtPayload }, @Body() dto: { text: string; tone?: string; instruction?: string }) {
    return this.aiClient.assistCopy({ userId: req.user.sub, ...dto });
  }

  @Post('generate-image')
  @ApiOperation({ summary: 'Generate an image using AI' })
  generateImage(@Req() req: Request & { user: JwtPayload }, @Body() dto: { prompt: string }) {
    return this.aiClient.generateImage({ userId: req.user.sub, prompt: dto.prompt });
  }

  @Post('generate-legal')
  @ApiOperation({ summary: 'Generate legal pages (TOS/Privacy)' })
  generateLegalPages(@Req() req: Request & { user: JwtPayload }, @Body() dto: { businessName: string; contactEmail: string }) {
    return this.aiClient.generateLegalPages({ userId: req.user.sub, ...dto });
  }

  @Post('stream')
  @ApiOperation({ summary: 'Start a streamed AI response' })
  streamPrompt(@Req() req: Request & { user: JwtPayload }, @Body() dto: { sessionId: string; prompt: string }) {
    return this.aiClient.streamPrompt({ userId: req.user.sub, ...dto });
  }

  @Get('quota')
  @ApiOperation({ summary: 'Get current AI usage quota' })
  getQuota(@Req() req: Request & { user: JwtPayload }) {
    return this.aiClient.getQuota(req.user.sub);
  }
}
