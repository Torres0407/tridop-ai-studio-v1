import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from './email/email.service';
import { SmsService } from './sms/sms.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { Contact } from './models/contact.model';
import { FormSubmission } from './models/formSubmission.model';
import { MessageThread } from './models/messageThread.model';

@Controller()
export class EngagementController {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private whatsappService: WhatsappService,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    @InjectModel(FormSubmission.name) private formModel: Model<FormSubmission>,
    @InjectModel(MessageThread.name) private threadModel: Model<MessageThread>,
  ) {}

  @MessagePattern('email.send')
  async sendEmail(@Payload() data: { to: string; subject: string; body: string }) {
    return this.emailService.sendEmail(data.to, data.subject, data.body);
  }

  @MessagePattern('sms.send')
  async sendSms(@Payload() data: { to: string; message: string; siteId?: string; contactId?: string }) {
    const result = await this.smsService.send(data.to, data.message);
    if (data.siteId && data.contactId) {
       await this.threadModel.updateOne(
         { siteId: data.siteId, contactId: data.contactId, channel: 'sms' },
         { $push: { messages: { body: data.message, direction: 'outbound', timestamp: new Date() } } },
         { upsert: true }
       );
    }
    return result;
  }

  @MessagePattern('whatsapp.send')
  async sendWhatsapp(@Payload() data: { to: string; template: string; parameters?: any; siteId?: string; contactId?: string }) {
    await this.whatsappService.send(data.to, data.template); // Using template as message for now unless a true WhatsApp Template API is used
    if (data.siteId && data.contactId) {
       await this.threadModel.updateOne(
         { siteId: data.siteId, contactId: data.contactId, channel: 'whatsapp' },
         { $push: { messages: { body: `Template: ${data.template}`, direction: 'outbound', timestamp: new Date() } } },
         { upsert: true }
       );
    }
    return { status: 'sent', to: data.to, channel: 'whatsapp' };
  }

  @MessagePattern('engagement.contacts.list')
  async listContacts(@Payload() data: { siteId: string }) {
    return this.contactModel.find({ siteId: data.siteId }).sort({ createdAt: -1 }).exec();
  }

  @MessagePattern('engagement.forms.list')
  async listForms(@Payload() data: { siteId: string }) {
    return this.formModel.find({ siteId: data.siteId }).sort({ createdAt: -1 }).exec();
  }

  @MessagePattern('engagement.messages.send')
  async sendCampaignMessage(@Payload() data: { siteId: string; contactId: string; channel: string; message: string; to: string }) {
    if (data.channel === 'sms') {
      return this.sendSms({ to: data.to, message: data.message, siteId: data.siteId, contactId: data.contactId });
    } else if (data.channel === 'whatsapp') {
      return this.sendWhatsapp({ to: data.to, template: data.message, siteId: data.siteId, contactId: data.contactId });
    }
    throw new Error('Unsupported channel');
  }

  @MessagePattern('reviews.get')
  async getReviews(@Payload() data: { siteId: string }) {
    return [];
  }

  @MessagePattern('reviews.sync')
  async syncReviews(@Payload() data: { siteId: string }) {
    return { status: 'sync_initiated', siteId: data.siteId };
  }
}
