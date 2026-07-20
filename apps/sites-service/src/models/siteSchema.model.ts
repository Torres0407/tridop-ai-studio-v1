import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'site_schemas' })
export class SiteSchemaModel extends Document {
  @Prop({ required: true })
  siteId!: string;

  @Prop({ required: true })
  ownerId!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ default: 'Draft' })
  status!: string;

  @Prop({ type: Array, default: [] })
  blocks!: any[];

  @Prop({ type: Array, default: [] })
  pages!: any[];

  @Prop({ type: Object, default: {} })
  globalSettings!: Record<string, any>;
}

export const SiteSchemaSchema = SchemaFactory.createForClass(SiteSchemaModel);
