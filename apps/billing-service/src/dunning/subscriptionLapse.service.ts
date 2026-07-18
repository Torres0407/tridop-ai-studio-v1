import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SubscriptionLapseService {
  constructor(@InjectQueue('events') private eventsQueue: Queue) {}
  async triggerLapse(subscriptionId: string) {
    await this.eventsQueue.add('SUBSCRIPTION_LAPSED', { subscriptionId });
  }
}
