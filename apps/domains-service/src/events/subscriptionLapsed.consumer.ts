import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class SubscriptionLapsedConsumer extends WorkerHost {
  async process(job: Job): Promise<any> {
    if (job.name === 'SUBSCRIPTION_LAPSED') {
      console.log('Starting grace period for domain connection');
    }
  }
}
