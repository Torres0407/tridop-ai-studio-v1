import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'blocks' })
export class BlockModel extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop({ required: true })
  blockId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ required: true })
  version: number;
}

export const BlockSchema = SchemaFactory.createForClass(BlockModel);
