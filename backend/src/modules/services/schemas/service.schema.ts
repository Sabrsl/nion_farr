import { z } from 'zod';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum ServiceCategory {
  WEB = 'web',
  MOBILE = 'mobile',
  DESIGN = 'design',
  MARKETING = 'marketing',
  WRITING = 'writing',
  VIDEO = 'video',
  BUSINESS = 'business',
  OTHER = 'other'
}

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: String, enum: ServiceCategory, required: true })
  category: ServiceCategory;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  provider: User;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  reviewCount: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Schéma de base pour la création de service
export const createServiceSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Le titre doit contenir au moins 5 caractères' })
    .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' }),
  
  description: z
    .string()
    .min(1000, { message: 'La description doit contenir au moins 1000 caractères' })
    .max(5000, { message: 'La description ne peut pas dépasser 5000 caractères' }),
  
  category: z
    .string()
    .min(2, { message: 'La catégorie doit contenir au moins 2 caractères' }),
  
  tags: z
    .array(z.string())
    .min(1, { message: 'Au moins un tag est requis' })
    .max(10, { message: 'Maximum 10 tags autorisés' })
    .optional(),
  
  price: z
    .number()
    .min(1000, { message: 'Le prix minimum est de 1000 FCFA' })
    .max(500000, { message: 'Le prix maximum est de 500000 FCFA' }),
  
  deliveryTime: z
    .number()
    .int()
    .min(1, { message: 'Le délai de livraison minimum est de 1 jour' })
    .max(90, { message: 'Le délai de livraison maximum est de 90 jours' }),
  
  isActive: z
    .boolean()
    .optional()
    .default(true),
  
  // Champs optionnels
  options: z
    .array(
      z.object({
        title: z.string().min(2),
        description: z.string().optional(),
        price: z.number().min(0),
      })
    )
    .optional(),
});

// Schéma pour la mise à jour de service (tous les champs sont optionnels)
export const updateServiceSchema = createServiceSchema.partial();

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>; 