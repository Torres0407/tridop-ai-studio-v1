import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class DeployCompletedConsumer extends WorkerHost {
  async process(job: Job): Promise<any> {
    if (job.name === 'DEPLOY_COMPLETED') {
      console.log('Deploy complete for site', job.data.siteId);
    }
  }
}
