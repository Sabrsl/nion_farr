import { z } from 'zod';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

// Schéma de base pour la création d'un paiement
export const createPaymentSchema = z.object({
  orderId: z
    .string()
    .uuid({ message: 'ID de commande invalide' }),
  
  amount: z
    .number()
    .int()
    .min(100, { message: 'Le montant minimum est de 100 FCFA' })
    .max(10000000, { message: 'Le montant maximum est de 10,000,000 FCFA' }),
  
  method: z
    .nativeEnum(PaymentMethod, { 
      errorMap: () => ({ message: 'Méthode de paiement invalide' }) 
    }),
  
  type: z
    .nativeEnum(PaymentType, { 
      errorMap: () => ({ message: 'Type de paiement invalide' }) 
    }),
  
  description: z
    .string()
    .max(255, { message: 'La description ne peut pas dépasser 255 caractères' })
    .optional(),
  
  metadata: z
    .record(z.any())
    .optional(),
});

// Schéma pour le rappel (webhook) de paiement
export const paymentWebhookSchema = z.object({
  transactionId: z
    .string()
    .min(1, { message: 'ID de transaction requis' }),
  
  providerTransactionId: z
    .string()
    .min(1, { message: 'ID de transaction du fournisseur requis' }),
  
  status: z
    .nativeEnum(PaymentStatus, { 
      errorMap: () => ({ message: 'Statut de paiement invalide' }) 
    }),
  
  amount: z
    .number()
    .int()
    .min(100, { message: 'Le montant minimum est de 100 FCFA' }),
  
  providerResponse: z
    .record(z.any())
    .optional(),
  
  metadata: z
    .record(z.any())
    .optional(),
});

// Schéma pour mettre à jour le statut d'un paiement (pour les administrateurs)
export const updatePaymentStatusSchema = z.object({
  status: z
    .nativeEnum(PaymentStatus, { 
      errorMap: () => ({ message: 'Statut de paiement invalide' }) 
    }),
  
  reason: z
    .string()
    .max(255, { message: 'La raison ne peut pas dépasser 255 caractères' })
    .optional(),
});

// Schéma pour le retrait d'argent
export const withdrawalSchema = z.object({
  amount: z
    .number()
    .int()
    .min(5000, { message: 'Le montant minimum de retrait est de 5000 FCFA' })
    .max(1000000, { message: 'Le montant maximum de retrait est de 1,000,000 FCFA' }),
  
  method: z
    .nativeEnum(PaymentMethod, { 
      errorMap: () => ({ message: 'Méthode de retrait invalide' }) 
    }),
  
  accountDetails: z
    .record(z.string())
    .refine((data) => {
      if (data.accountNumber && data.accountNumber.length < 5) {
        return false;
      }
      return true;
    }, {
      message: 'Détails du compte invalides',
      path: ['accountDetails'],
    }),
  
  description: z
    .string()
    .max(255, { message: 'La description ne peut pas dépasser 255 caractères' })
    .optional(),
});

// Schéma pour les transactions
export const transactionSchema = z.object({
  userId: z
    .string()
    .uuid({ message: 'ID d\'utilisateur invalide' }),
  
  amount: z
    .number()
    .int()
    .min(100, { message: 'Le montant minimum est de 100 FCFA' }),
  
  type: z
    .nativeEnum(PaymentType, { 
      errorMap: () => ({ message: 'Type de transaction invalide' }) 
    }),
  
  description: z
    .string()
    .max(255, { message: 'La description ne peut pas dépasser 255 caractères' })
    .optional(),
  
  orderId: z
    .string()
    .uuid({ message: 'ID de commande invalide' })
    .optional(),
  
  metadata: z
    .record(z.any())
    .optional(),
});

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type PaymentWebhookDto = z.infer<typeof paymentWebhookSchema>;
export type UpdatePaymentStatusDto = z.infer<typeof updatePaymentStatusSchema>;
export type WithdrawalDto = z.infer<typeof withdrawalSchema>;
export type TransactionDto = z.infer<typeof transactionSchema>; 