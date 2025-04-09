import { z } from 'zod';
import { PaymentGatewayType } from '../enums/payment-gateway-type.enum';

// Schéma de base pour la création d'une passerelle de paiement
export const createPaymentGatewaySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
  
  type: z
    .nativeEnum(PaymentGatewayType, { 
      errorMap: () => ({ message: 'Type de passerelle de paiement invalide' }) 
    }),
  
  isActive: z
    .boolean()
    .optional()
    .default(true),
  
  isSandbox: z
    .boolean()
    .optional()
    .default(false),
  
  config: z.object({
    apiKey: z
      .string()
      .min(1, { message: 'Clé API requise' })
      .optional(),
    
    secretKey: z
      .string()
      .min(1, { message: 'Clé secrète requise' })
      .optional(),
    
    merchantId: z
      .string()
      .min(1, { message: 'ID de marchand requis' })
      .optional(),
    
    webhookSecret: z
      .string()
      .min(1, { message: 'Secret de webhook requis' })
      .optional(),
    
    endpoint: z
      .string()
      .url({ message: 'URL de point de terminaison invalide' })
      .optional(),
    
    callbackUrl: z
      .string()
      .url({ message: 'URL de rappel invalide' })
      .optional(),
    
    additionalParams: z
      .record(z.any())
      .optional(),
  }).optional(),
  
  description: z
    .string()
    .max(500, { message: 'La description ne peut pas dépasser 500 caractères' })
    .optional(),
  
  supportedMethods: z
    .array(z.string())
    .min(1, { message: 'Au moins une méthode de paiement prise en charge est requise' })
    .optional(),
  
  fee: z
    .number()
    .min(0, { message: 'Les frais ne peuvent pas être négatifs' })
    .max(10000, { message: 'Les frais ne peuvent pas dépasser 10,000 FCFA' })
    .optional(),
  
  feePercent: z
    .number()
    .min(0, { message: 'Le pourcentage de frais ne peut pas être négatif' })
    .max(100, { message: 'Le pourcentage de frais ne peut pas dépasser 100%' })
    .optional(),
});

// Schéma pour mettre à jour une passerelle de paiement (tous les champs sont optionnels)
export const updatePaymentGatewaySchema = createPaymentGatewaySchema.partial();

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreatePaymentGatewayDto = z.infer<typeof createPaymentGatewaySchema>;
export type UpdatePaymentGatewayDto = z.infer<typeof updatePaymentGatewaySchema>; 