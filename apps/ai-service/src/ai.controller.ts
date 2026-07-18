import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AIRouter } from './router/AIRouter';
import { QuotaTracker } from './quota/quotaTracker';
import { AssembleContext } from './context/assembleContext';
import { StreamRelay } from './lib/streamRelay';
import { generateSitePrompt } from './prompts/generateSite';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

@Controller()
export class AIController {
  private redis: Redis;
  constructor(
    private readonly aiRouter: AIRouter,
    private readonly quotaTracker: QuotaTracker,
    private readonly assembleContext: AssembleContext,
    private readonly streamRelay: StreamRelay,
    @InjectQueue('ai-generation') private readonly aiQueue: Queue,
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  @MessagePattern('ai.prompt')
  async handlePrompt(@Payload() data: { userId: string; prompt: string }) {
    const hasQuota = await this.quotaTracker.checkQuota(data.userId);
    if (!hasQuota) throw new Error('Quota exceeded');
    return this.aiRouter.routePrompt(data.prompt, 'low');
  }

  @MessagePattern('ai.generate')
  async handleGenerate(@Payload() data: { userId: string; siteId: string; prompt: string }) {
    const hasQuota = await this.quotaTracker.checkQuota(data.userId);
    if (!hasQuota) throw new Error('Quota exceeded');

    // Create a new job in BullMQ queue
    const job = await this.aiQueue.add('generate-site', data);
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern('ai.generate.status')
  async handleGenerateStatus(@Payload() data: { jobId: string }) {
    // Read status from Redis that was set by GenerationConsumer
    const status = await this.redis.get(`generation-status:${data.jobId}`);
    if (status === 'completed') {
      const result = await this.redis.get(`generation-result:${data.jobId}`);
      return { status, result: JSON.parse(result || '{}') };
    }
    return { status: status || 'unknown' };
  }

  @MessagePattern('ai.suggestDomains')
  async handleSuggestDomains(@Payload() data: { userId: string; businessName: string; industry?: string }) {
    const prompt = `Suggest 5 modern, catchy domain names for a ${data.industry || 'business'} named "${data.businessName}". Return ONLY a JSON array of strings formatted like ["example.com", ...].`;
    const result = await this.aiRouter.routePrompt(prompt, 'low');
    return JSON.parse(result);
  }

  @MessagePattern('ai.prefill')
  async handlePrefill(@Payload() data: { userId: string; businessProfile: any }) {
    const prompt = `Generate default landing page copy and blocks for a business profile: ${JSON.stringify(data.businessProfile)}. Return JSON matching block structure.`;
    const result = await this.aiRouter.routePrompt(prompt, 'high');
    return JSON.parse(result);
  }

  @MessagePattern('ai.assistCopy')
  async handleAssistCopy(@Payload() data: { userId: string; text: string; tone?: string; instruction?: string }) {
    const prompt = `Rewrite the following website copy to be more compelling. Tone: ${data.tone || 'professional'}. Instruction: ${data.instruction || 'Improve clarity'}.\nOriginal text: "${data.text}"`;
    const result = await this.aiRouter.routePrompt(prompt, 'low');
    return { text: result.trim() };
  }

  @MessagePattern('ai.generateImage')
  async handleGenerateImage(@Payload() data: { userId: string; prompt: string }) {
    // Uses Google Vertex AI Imagen 3 for Image generation
    const prompt = `Generate an image for: ${data.prompt}`;
    const result = await this.aiRouter.routePrompt(prompt, 'high');
    // Assuming Imagen returns base64 or a URI to Google Cloud Storage
    return { url: result, prompt: data.prompt };
  }

  @MessagePattern('ai.generateLegalPages')
  async handleGenerateLegalPages(@Payload() data: { userId: string; businessName: string; contactEmail: string }) {
    const prompt = `Generate Privacy Policy and Terms of Service for ${data.businessName} (contact: ${data.contactEmail}). Return JSON formatted as: {"privacy": "...", "terms": "..."}`;
    const result = await this.aiRouter.routePrompt(prompt, 'low');
    return JSON.parse(result);
  }

  @MessagePattern('ai.streamPrompt')
  async handleStreamPrompt(@Payload() data: { userId: string; sessionId: string; prompt: string }) {
    const result = await this.aiRouter.routePrompt(data.prompt, 'low');
    await this.streamRelay.publishChunk(data.sessionId, result);
    await this.streamRelay.publishDone(data.sessionId);
    return { sessionId: data.sessionId, status: 'streaming' };
  }

  @MessagePattern('ai.quota.get')
  async handleGetQuota(@Payload() data: { userId: string }) {
    return this.quotaTracker.getQuota(data.userId);
  }
}
