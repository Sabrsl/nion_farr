import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export enum ServiceCategory {
  GRAPHIC_DESIGN = 'graphic_design',
  WEB_DEVELOPMENT = 'web_development',
  MOBILE_DEVELOPMENT = 'mobile_development',
  CONTENT_WRITING = 'content_writing',
  TRANSLATION = 'translation',
  MARKETING = 'marketing',
  VIDEO_EDITING = 'video_editing',
  VOICE_OVER = 'voice_over',
  SOCIAL_MEDIA = 'social_media',
  OTHER = 'other',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
})
export class Service extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  provider: User | MongooseSchema.Types.ObjectId;

  @Prop({ enum: Object.values(ServiceCategory), required: true })
  category: ServiceCategory;

  @Prop([String])
  tags: string[];

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  deliveryTime: number;

  @Prop({ required: true })
  revisions: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  thumbnail: string;

  @Prop({ enum: Object.values(ServiceStatus), default: ServiceStatus.PENDING })
  status: ServiceStatus;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  packages: {
    name: string;
    description: string;
    price: number;
    deliveryTime: number;
    revisions: number;
    features: string[];
  }[];

  @Prop({ default: false })
  hasOfferPackages: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  faqs: {
    question: string;
    answer: string;
  }[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  requirements: {
    title: string;
    description: string;
    isRequired: boolean;
    type: string;
  }[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  sales: number;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ type: String })
  rejectionReason: string;

  @Prop()
  reviewedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy: User | MongooseSchema.Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service); 