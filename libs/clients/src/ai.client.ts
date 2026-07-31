// ─── libs/clients/src/ai.client.ts ──────────────────────────────────────────
// STUB — implemented in Phase 4 (ai-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const AI_CLIENT = 'AI_SERVICE';

@Injectable()
export class AiClient extends BaseServiceClient {
  constructor(@InjectClient(AI_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  getQuota(userId: string): Promise<never> {
    return this.send('ai.quota.get', { userId });
  }
  getAiCost(): Promise<never> {
    return this.send('ai.cost.get', {});
  }
  prompt(dto: { userId: string; prompt: string; model?: string }) {
    return this.send('ai.prompt', dto, { timeoutMs: 60_000 });
  }
  generate(dto: { userId: string; siteId: string; prompt: string; model?: string }) {
    return this.send('ai.generate', dto, { timeoutMs: 60_000 });
  }
  getGenerateStatus(jobId: string) {
    return this.send('ai.generate.status', { jobId });
  }
  suggestDomains(dto: { userId: string; businessName: string; industry?: string }) {
    return this.send('ai.suggestDomains', dto);
  }
  prefill(dto: { userId: string; businessProfile: any }) {
    return this.send('ai.prefill', dto, { timeoutMs: 60_000 });
  }
  assistCopy(dto: { userId: string; text: string; tone?: string; instruction?: string; model?: string }) {
    return this.send('ai.assistCopy', dto);
  }
  generateImage(dto: { userId: string; prompt: string }) {
    return this.send('ai.generateImage', dto, { timeoutMs: 30_000 });
  }
  generateLegalPages(dto: { userId: string; businessName: string; contactEmail: string }) {
    return this.send('ai.generateLegalPages', dto, { timeoutMs: 60_000 });
  }
  streamPrompt(dto: { userId: string; sessionId: string; prompt: string }) {
    return this.send('ai.streamPrompt', dto, { timeoutMs: 60_000 });
  }
}
