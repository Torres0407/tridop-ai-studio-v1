import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Processor('events')
export class UserCreatedConsumer extends WorkerHost {
  private readonly logger = new Logger(UserCreatedConsumer.name);

  constructor(private readonly email: EmailService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    if (job.name !== 'USER_CREATED') return;

    const { userId, email } = job.data;
    this.logger.log(`Sending welcome email to new user ${userId}`);

    await this.email.sendEmail(
      email,
      'Welcome to TridopAI!',
      `Hello! Your account has been created. Start building your AI-powered website today.`,
    );
  }
}
