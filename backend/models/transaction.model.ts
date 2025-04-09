import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';
import { Order } from './order.model';
import { Withdrawal } from './withdrawal.model';

export enum TransactionType {
  ORDER_PAYMENT = 'order_payment',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  COMMISSION = 'commission',
  SYSTEM_ADJUSTMENT = 'system_adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
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
export class Transaction extends Document {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ enum: Object.values(TransactionType), required: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User | MongooseSchema.Types.ObjectId;

  @Prop({ enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  order: Order | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Withdrawal' })
  withdrawal: Withdrawal | MongooseSchema.Types.ObjectId;

  @Prop()
  paymentMethod: string;

  @Prop()
  paymentProvider: string;

  @Prop()
  externalTransactionId: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;

  @Prop()
  processedAt: Date;

  @Prop({ default: false })
  isReversed: boolean;

  @Prop()
  reversalReason: string;

  @Prop()
  reversedAt: Date;

  @Prop()
  source: string;

  @Prop()
  destination: string;

  @Prop()
  fee: number;

  @Prop()
  currency: string;

  @Prop()
  notes: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction); 