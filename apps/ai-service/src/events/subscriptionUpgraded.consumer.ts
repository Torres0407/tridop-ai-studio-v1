import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class SubscriptionUpgradedConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'SUBSCRIPTION_UPGRADED') {
      console.log('User upgraded, raising quota:', job.data.userId);
    }
  }
}
