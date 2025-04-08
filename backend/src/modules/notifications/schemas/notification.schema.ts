import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_ACCEPTED = 'order_accepted',
  ORDER_REJECTED = 'order_rejected',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_COMPLETED = 'order_completed',
  ORDER_REVISION = 'order_revision',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_REFUNDED = 'payment_refunded',
  PAYMENT_WITHDRAWAL = 'payment_withdrawal',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  DISPUTE_CREATED = 'dispute_created',
  DISPUTE_UPDATED = 'dispute_updated',
  DISPUTE_RESOLVED = 'dispute_resolved',
  DISPUTE_MESSAGE = 'dispute_message',
  NEW_MESSAGE = 'new_message',
  REVIEW_RECEIVED = 'review_received',
  SYSTEM = 'system'
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
export class Notification extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: Object.values(NotificationType), required: true })
  type: NotificationType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  metadata: any;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification); 