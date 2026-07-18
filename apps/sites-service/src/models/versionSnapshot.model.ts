import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'version_snapshots' })
export class VersionSnapshotModel extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop({ required: true })
  versionNumber: number;

  @Prop({ required: true })
  createdBy: string; // userId

  @Prop({ type: Object, required: true })
  snapshotData: Record<string, any>; // The entire state of blocks at this point in time

  @Prop()
  commitMessage: string;
}

export const VersionSnapshotSchema = SchemaFactory.createForClass(VersionSnapshotModel);
