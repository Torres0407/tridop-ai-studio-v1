import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { EngagementController } from './engagement.controller';
import { EmailService } from './email/email.service';
import { SmsService } from './sms/sms.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { WhatsappWebhook } from './whatsapp/whatsapp.webhook';
import { ReviewsSyncWorker } from './reviews/reviewsSyncWorker';
import { ReviewsCacheModel, ReviewsCacheSchema } from './models/reviewsCache.model';
import { Contact, ContactSchema } from './models/contact.model';
import { FormSubmission, FormSubmissionSchema } from './models/formSubmission.model';
import { MessageThread, MessageThreadSchema } from './models/messageThread.model';
import { Review, ReviewSchema } from './models/review.model';

import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL', 'mongodb://localhost:27017/engagement_db'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: ReviewsCacheModel.name, schema: ReviewsCacheSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: FormSubmission.name, schema: FormSubmissionSchema },
      { name: MessageThread.name, schema: MessageThreadSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: Number(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port) || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'events' }),
  ],
  controllers: [EngagementController, HealthController],
  providers: [
    EmailService,
    SmsService,
    WhatsappService,
    WhatsappWebhook,
    ReviewsSyncWorker
  ],
})
export class AppModule {}
