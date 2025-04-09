import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';
import { Order } from './order.model';

export enum DisputeStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED_FOR_CLIENT = 'resolved_for_client',
  RESOLVED_FOR_PROVIDER = 'resolved_for_provider',
  CANCELLED = 'cancelled',
}

export enum DisputeReason {
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  QUALITY_NOT_AS_EXPECTED = 'quality_not_as_expected',
  DELAYED_DELIVERY = 'delayed_delivery',
  UNRESPONSIVE_FREELANCER = 'unresponsive_freelancer',
  UNRESPONSIVE_CLIENT = 'unresponsive_client',
  SCOPE_CHANGE = 'scope_change',
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
export class Dispute extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  order: Order | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  openedBy: User | MongooseSchema.Types.ObjectId;

  @Prop({ enum: Object.values(DisputeReason), required: true })
  reason: DisputeReason;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  evidence: string[];

  @Prop({ enum: Object.values(DisputeStatus), default: DisputeStatus.PENDING })
  status: DisputeStatus;

  @Prop()
  resolution: string;

  @Prop()
  resolvedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  resolvedBy: User | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  timeline: {
    status: DisputeStatus;
    date: Date;
    comments: string;
    actor: string;
  }[];

  @Prop({ type: [{ type: MongooseSchema.Types.Mixed }], default: [] })
  messages: {
    sender: User | MongooseSchema.Types.ObjectId;
    content: string;
    createdAt: Date;
    isAdmin: boolean;
    attachments: string[];
  }[];
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute); 