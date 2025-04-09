import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';
import { Service } from './service.model';

export enum OrderStatus {
  EN_ATTENTE = 'en_attente',
  EN_ATTENTE_PAIEMENT = 'en_attente_paiement',
  EN_ATTENTE_ACCEPTATION = 'en_attente_acceptation',
  EN_COURS = 'en_cours',
  LIVRE = 'livre',
  REVISION_DEMANDEE = 'revision_demandee',
  EN_MODIFICATION = 'en_modification',
  TERMINE = 'termine',
  ANNULE = 'annule',
  LITIGE = 'litige',
  LIVRAISON_EN_RETARD = 'livraison_en_retard',
}

export enum PaymentStatus {
  EN_ATTENTE = 'en_attente',
  PAYE = 'paye',
  REMBOURSE = 'rembourse',
  ANNULE = 'annule',
}

export enum PaymentMethod {
  WAVE = 'wave',
  ORANGE_MONEY = 'orange_money',
  FREE_MONEY = 'free_money',
  CARTE_BANCAIRE = 'carte_bancaire',
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
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
  service: Service | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  client: User | MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  provider: User | MongooseSchema.Types.ObjectId;

  @Prop({ enum: Object.values(OrderStatus), default: OrderStatus.EN_ATTENTE_PAIEMENT })
  status: OrderStatus;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  serviceFee: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ enum: Object.values(PaymentStatus), default: PaymentStatus.EN_ATTENTE })
  paymentStatus: PaymentStatus;

  @Prop({ enum: Object.values(PaymentMethod) })
  paymentMethod: PaymentMethod;

  @Prop()
  transactionId: string;

  @Prop()
  paymentDate: Date;

  @Prop({ required: true })
  deliveryTime: number;

  @Prop()
  deadline: Date;

  @Prop()
  expectedDeliveryDate: Date;

  @Prop()
  completedDate: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  requirements: {
    question: string;
    answer: string;
    attachment: string;
  }[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  deliverables: {
    title: string;
    description: string;
    files: string[];
    deliveredAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
  }[];

  @Prop({ default: 0 })
  revisionsCount: number;

  @Prop({ default: 3 })
  revisionsRemaining: number;

  @Prop({ type: String })
  cancelReason: string;

  @Prop()
  cancelledBy: string;

  @Prop()
  cancelledAt: Date;

  @Prop()
  deliveryValidationDeadline: Date;

  @Prop({ default: false })
  isReviewed: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  review: {
    rating: number;
    comment: string;
    createdAt: Date;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  dispute: {
    openedAt: Date;
    reason: string;
    description: string;
    evidence: string[];
    openedBy: string;
    status: 'pending' | 'resolved' | 'closed';
    resolution: string;
    resolvedAt: Date;
  };

  @Prop({ type: [{ type: MongooseSchema.Types.Mixed }], default: [] })
  timeline: {
    status: OrderStatus;
    description: string;
    date: Date;
    actor: string;
  }[];
}

export const OrderSchema = SchemaFactory.createForClass(Order); 