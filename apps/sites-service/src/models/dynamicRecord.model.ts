import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'dynamic_records' })
export class DynamicRecordModel extends Document {
  @Prop({ required: true, index: true })
  siteId: string;

  @Prop({ required: true, index: true })
  schemaType: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;
}

export const DynamicRecordSchema = SchemaFactory.createForClass(DynamicRecordModel);
