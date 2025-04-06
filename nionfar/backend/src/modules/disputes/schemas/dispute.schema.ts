import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';

export enum DisputeStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED_CLIENT = 'resolved_client',
  RESOLVED_PROVIDER = 'resolved_provider',
  RESOLVED_PARTIAL = 'resolved_partial',
  REJECTED = 'rejected'
}

export enum DisputeReason {
  QUALITY_NOT_AS_EXPECTED = 'quality_not_as_expected',
  ORDER_NOT_DELIVERED = 'order_not_delivered',
  REQUIREMENTS_NOT_MET = 'requirements_not_met',
  INCORRECT_ORDER = 'incorrect_order',
  COMMUNICATION_ISSUES = 'communication_issues',
  OTHER = 'other'
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Dispute extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true })
  order: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  openedBy: mongoose.Types.ObjectId;

  @Prop({ enum: Object.values(DisputeReason), required: true })
  reason: DisputeReason;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  evidence: string[];

  @Prop({ enum: Object.values(DisputeStatus), default: DisputeStatus.PENDING })
  status: DisputeStatus;

  @Prop({ type: [
    {
      status: { type: String, enum: Object.values(DisputeStatus), required: true },
      date: { type: Date, default: Date.now },
      comments: { type: String },
      actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ], default: [] })
  timeline: {
    status: DisputeStatus,
    date: Date,
    comments: string,
    actor: mongoose.Types.ObjectId
  }[];

  @Prop({ type: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      isAdmin: { type: Boolean, default: false },
      attachments: { type: [String], default: [] }
    }
  ], default: [] })
  messages: {
    sender: mongoose.Types.ObjectId,
    content: string,
    createdAt: Date,
    isAdmin: boolean,
    attachments: string[]
  }[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  resolvedBy: mongoose.Types.ObjectId;

  @Prop({ type: Date })
  resolvedAt: Date;

  @Prop({ type: String })
  resolution: string;

  @Prop({ type: Number })
  refundAmount: number;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute); 