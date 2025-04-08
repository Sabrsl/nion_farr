import { z } from 'zod';
import { OrderStatus } from '../enums/order-status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Service } from '../../services/schemas/service.schema';

// Schéma de base pour la création d'une commande
export const createOrderSchema = z.object({
  serviceId: z
    .string()
    .uuid({ message: 'ID de service invalide' }),
  
  optionIds: z
    .array(z.string().uuid({ message: 'ID d\'option invalide' }))
    .optional(),
  
  requirements: z
    .string()
    .min(10, { message: 'Les exigences doivent contenir au moins 10 caractères' })
    .max(5000, { message: 'Les exigences ne peuvent pas dépasser 5000 caractères' }),
  
  attachments: z
    .array(z.string())
    .max(10, { message: 'Maximum 10 pièces jointes autorisées' })
    .optional(),
});

// Schéma pour mettre à jour une commande (pour un client)
export const updateOrderSchema = z.object({
  requirements: z
    .string()
    .min(10, { message: 'Les exigences doivent contenir au moins 10 caractères' })
    .max(5000, { message: 'Les exigences ne peuvent pas dépasser 5000 caractères' })
    .optional(),
  
  attachments: z
    .array(z.string())
    .max(10, { message: 'Maximum 10 pièces jointes autorisées' })
    .optional(),
});

// Schéma pour livrer une commande (pour un prestataire)
export const deliverOrderSchema = z.object({
  deliveryMessage: z
    .string()
    .min(10, { message: 'Le message de livraison doit contenir au moins 10 caractères' })
    .max(2000, { message: 'Le message de livraison ne peut pas dépasser 2000 caractères' }),
  
  deliveryFiles: z
    .array(z.string())
    .min(1, { message: 'Au moins un fichier de livraison est requis' })
    .max(20, { message: 'Maximum 20 fichiers de livraison autorisés' }),
});

// Schéma pour mettre à jour le statut d'une commande (pour les administrateurs)
export const updateOrderStatusSchema = z.object({
  status: z
    .nativeEnum(OrderStatus, { 
      errorMap: () => ({ message: 'Statut de commande invalide' }) 
    }),
  
  reason: z
    .string()
    .max(500, { message: 'La raison ne peut pas dépasser 500 caractères' })
    .optional(),
});

// Schéma pour demander une révision (pour un client)
export const requestRevisionSchema = z.object({
  revisionMessage: z
    .string()
    .min(10, { message: 'Le message de révision doit contenir au moins 10 caractères' })
    .max(2000, { message: 'Le message de révision ne peut pas dépasser 2000 caractères' }),
  
  revisionDetails: z
    .array(z.string())
    .min(1, { message: 'Au moins un point de révision est requis' })
    .max(10, { message: 'Maximum 10 points de révision autorisés' }),
  
  attachments: z
    .array(z.string())
    .max(5, { message: 'Maximum 5 pièces jointes autorisées' })
    .optional(),
});

// Schéma pour annuler une commande
export const cancelOrderSchema = z.object({
  cancelReason: z
    .string()
    .min(10, { message: 'La raison d\'annulation doit contenir au moins 10 caractères' })
    .max(500, { message: 'La raison d\'annulation ne peut pas dépasser 500 caractères' }),
});

// Schéma pour accepter une commande (pour un prestataire)
export const acceptOrderSchema = z.object({
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { 
      message: 'Format de date de début invalide' 
    })
    .optional(),
  
  estimatedCompletionDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { 
      message: 'Format de date d\'achèvement estimée invalide' 
    })
    .optional(),
});

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
export type DeliverOrderDto = z.infer<typeof deliverOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type RequestRevisionDto = z.infer<typeof requestRevisionSchema>;
export type CancelOrderDto = z.infer<typeof cancelOrderSchema>;
export type AcceptOrderDto = z.infer<typeof acceptOrderSchema>;

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  client: User;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  freelancer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  budget: number;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  completionMessage: string;

  @Prop()
  acceptedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop()
  cancelledAt: Date;

  @Prop()
  cancellationReason: string;

  @Prop()
  revisionRequestedAt: Date;

  @Prop()
  revisionMessage: string;

  @Prop()
  deliveredAt: Date;

  @Prop()
  deliveryMessage: string;

  @Prop({ type: [String] })
  deliveryFiles: string[];
}

export const OrderSchema = SchemaFactory.createForClass(Order); 