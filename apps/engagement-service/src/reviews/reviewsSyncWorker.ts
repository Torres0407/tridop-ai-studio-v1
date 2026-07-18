import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class ReviewsSyncWorker extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'SYNC_REVIEWS') {
      console.log('Syncing Google reviews');
    }
  }
}
