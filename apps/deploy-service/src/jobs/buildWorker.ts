import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class BuildWorker extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'DEPLOY_TRIGGERED') {
      console.log('Processing build for', job.data.siteId);
    }
  }
}
