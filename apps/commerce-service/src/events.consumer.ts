import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { BookingsService } from './bookings/bookings.service';

@Processor('events')
@Injectable()
export class EventsConsumer extends WorkerHost {
  private readonly logger = new Logger(EventsConsumer.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly bookingsService: BookingsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing event: ${job.name}`);
    if (job.name === 'SITE_DELETED') {
      const { siteId } = job.data;
      if (!siteId) return;
      
      this.logger.log(`Purging orphaned data for site: ${siteId}`);
      
      // Cleanup Products
      await this.productsService.deleteProductsBySite(siteId);
      
      // Cleanup Bookings
      await this.bookingsService.deleteBookingsBySite(siteId);
      
      this.logger.log(`Successfully purged orphaned data for site: ${siteId}`);
    }
  }
}
