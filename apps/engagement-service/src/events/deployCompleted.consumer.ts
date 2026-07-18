import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Processor('events')
export class DeployCompletedConsumer extends WorkerHost {
  private readonly logger = new Logger(DeployCompletedConsumer.name);

  constructor(private readonly email: EmailService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    if (job.name !== 'DEPLOY_COMPLETED' && job.name !== 'DEPLOY_FAILED') return;

    const { siteId, ownerEmail, domain } = job.data;

    if (job.name === 'DEPLOY_COMPLETED') {
      this.logger.log(`Notifying owner of successful deploy for site ${siteId}`);
      await this.email.sendEmail(
        ownerEmail,
        'Your site is live! 🚀',
        `Your site is now live at ${domain}. Visit it to see your changes.`,
      );
    } else {
      this.logger.warn(`Notifying owner of failed deploy for site ${siteId}`);
      await this.email.sendEmail(
        ownerEmail,
        'Deploy failed',
        `We encountered an issue deploying your site ${siteId}. Our team has been notified.`,
      );
    }
  }
}
