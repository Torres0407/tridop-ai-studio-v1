import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class DomainRegisteredConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'DOMAIN_REGISTERED') {
      console.log('Domain registered, triggering deploy for', job.data.siteId);
    }
  }
}
