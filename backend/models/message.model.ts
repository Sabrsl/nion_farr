import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';
import { Order } from './order.model';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
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
export class Message extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: User | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  recipient: User | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversation', required: true })
  conversation: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  order: Order | MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: Object.values(MessageType), default: MessageType.TEXT })
  type: MessageType;

  @Prop()
  attachment: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;
  };

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop()
  editedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

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
export class Conversation extends Document {
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], required: true })
  participants: User[] | MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  order: Order | MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  lastMessage: {
    content: string;
    createdAt: Date;
    sender: MongooseSchema.Types.ObjectId;
    type?: MessageType;
  };

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  unreadCount: Record<string, number>;

  @Prop({ default: false })
  isOrderRelated: boolean;

  @Prop()
  title: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation); 