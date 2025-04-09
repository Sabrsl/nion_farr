import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum WithdrawalMethod {
  BANK_TRANSFER = 'bank_transfer',
  WAVE = 'wave',
  ORANGE_MONEY = 'orange_money',
  FREE_MONEY = 'free_money',
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
export class Withdrawal extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User | MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: Object.values(WithdrawalStatus), default: WithdrawalStatus.PENDING })
  status: WithdrawalStatus;

  @Prop({ enum: Object.values(WithdrawalMethod), required: true })
  method: WithdrawalMethod;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    swiftCode?: string;
    mobileNumber?: string;
    provider?: string;
  };

  @Prop()
  transactionId: string;

  @Prop()
  processedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop()
  rejectionReason: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  processedBy: User | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  history: {
    status: WithdrawalStatus;
    date: Date;
    notes: string;
    by: string;
  }[];
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal); 