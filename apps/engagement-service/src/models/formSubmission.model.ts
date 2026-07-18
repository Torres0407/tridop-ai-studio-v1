import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class FormSubmission extends Document {
  @Prop({ required: true })
  siteId: string;

  @Prop()
  contactId: string;

  @Prop({ required: true })
  formName: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  data: any;
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);
