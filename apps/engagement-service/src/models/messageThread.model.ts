import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class MessageThread extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop()
  contactId: string;

  @Prop({ required: true })
  channel: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  messages: any[];
}

export const MessageThreadSchema = SchemaFactory.createForClass(MessageThread);
