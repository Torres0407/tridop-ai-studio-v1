import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop()
  contactId: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  source: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
