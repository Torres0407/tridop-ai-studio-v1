import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contact extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({ default: 0 })
  lifetimeValue: number;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
