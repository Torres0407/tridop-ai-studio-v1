import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'ab_tests' })
export class ABTestModel extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['draft', 'running', 'completed'] })
  status: string;

  @Prop({ type: [Object], required: true })
  variants: {
    variantId: string;
    weight: number;
    blocksOverride: Record<string, any>;
  }[];

  @Prop({ type: Object, default: {} })
  results: Record<string, any>;
}

export const ABTestSchema = SchemaFactory.createForClass(ABTestModel);
