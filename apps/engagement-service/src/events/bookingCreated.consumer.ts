import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';

@Processor('events')
export class BookingCreatedConsumer extends WorkerHost {
  private readonly logger = new Logger(BookingCreatedConsumer.name);

  constructor(
    private readonly sms: SmsService,
    private readonly email: EmailService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    if (job.name !== 'BOOKING_CREATED') return;

    const { bookingId, ownerPhone, ownerEmail, customerName, startTime } = job.data;

    this.logger.log(`New booking ${bookingId} — notifying business owner`);

    const message = `New booking from ${customerName} at ${new Date(startTime).toLocaleString()}`;

    await Promise.allSettled([
      this.sms.send(ownerPhone, message),
      this.email.sendEmail(ownerEmail, 'New Booking Received', message),
    ]);
  }
}
