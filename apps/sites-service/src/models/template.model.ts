import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'templates' })
export class TemplateModel extends Document {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Object, required: true })
  defaultBlocks: Record<string, any>;

  @Prop({ type: Object, default: {} })
  globalSettings: Record<string, any>;
}

export const TemplateSchema = SchemaFactory.createForClass(TemplateModel);
