import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AIRouter } from '../router/AIRouter';
import { AssembleContext } from '../context/assembleContext';
import { generateSitePrompt } from '../prompts/generateSite';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';

@Processor('ai-generation')
export class GenerationConsumer extends WorkerHost {
  private readonly logger = new Logger(GenerationConsumer.name);
  private redis: Redis;

  constructor(
    private readonly aiRouter: AIRouter,
    private readonly assembleContext: AssembleContext,
    @Inject('SITES_SERVICE') private sitesClient: ClientProxy,
  ) {
    super();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async process(job: Job<{ userId: string; siteId: string; prompt: string }>): Promise<any> {
    const { userId, siteId, prompt } = job.data;
    this.logger.log(`Starting AI generation job ${job.id} for site ${siteId}`);

    try {
      await this.redis.set(`generation-status:${job.id}`, 'processing');
      const context = await this.assembleContext.assemble(userId, siteId);
      const fullPrompt = `${generateSitePrompt(context)}\nUser Instruction: ${prompt}`;
      
      const result = await this.aiRouter.routePrompt(fullPrompt, 'high');
      const parsed = JSON.parse(result);

      // We should ideally send this to the sites-service to save it.
      // For now, we will cache the result in Redis for the API gateway to poll.
      await this.redis.set(`generation-status:${job.id}`, 'completed');
      await this.redis.set(`generation-result:${job.id}`, JSON.stringify(parsed));
      
      return parsed;
    } catch (error) {
      this.logger.error(`AI generation failed for job ${job.id}`, error);
      await this.redis.set(`generation-status:${job.id}`, 'failed');
      throw error;
    }
  }
}
