import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'reviews_cache' })
export class ReviewsCacheModel extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop({ required: true })
  source: string; // 'google' | 'facebook'

  @Prop({ type: Array, default: [] })
  reviews: any[];
}

export const ReviewsCacheSchema = SchemaFactory.createForClass(ReviewsCacheModel);
