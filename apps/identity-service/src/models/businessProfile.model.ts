import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'business_profiles', timestamps: true })
export class BusinessProfile extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ required: true })
  businessName!: string;

  @Prop()
  category?: string;

  @Prop()
  industry?: string;

  @Prop([String])
  selectedFeatures?: string[];


  @Prop()
  description?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  paystackSubaccountCode?: string;

  @Prop()
  bankCode?: string;

  @Prop()
  accountNumber?: string;
}

export const BusinessProfileSchema = SchemaFactory.createForClass(BusinessProfile);
