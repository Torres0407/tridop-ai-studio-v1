import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('events')
export class UserCreatedConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'USER_CREATED') {
      console.log('Creating free subscription for', job.data.userId);
    }
  }
}
