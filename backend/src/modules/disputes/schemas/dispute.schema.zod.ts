import { z } from 'zod';
import { DisputeReason, DisputeStatus } from './dispute.schema';

// Schéma de base pour la création d'un litige
export const createDisputeSchema = z.object({
  orderId: z
    .string()
    .uuid({ message: 'ID de commande invalide' }),
  
  reason: z
    .nativeEnum(DisputeReason, { 
      errorMap: () => ({ message: 'Raison de litige invalide' }) 
    }),
  
  description: z
    .string()
    .min(50, { message: 'La description doit contenir au moins 50 caractères' })
    .max(2000, { message: 'La description ne peut pas dépasser 2000 caractères' }),
  
  evidence: z
    .array(z.string())
    .max(10, { message: 'Maximum 10 preuves autorisées' })
    .optional(),
});

// Schéma pour ajouter un message à un litige
export const addDisputeMessageSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Le contenu ne peut pas être vide' })
    .max(2000, { message: 'Le contenu ne peut pas dépasser 2000 caractères' }),
  
  attachments: z
    .array(z.string())
    .max(5, { message: 'Maximum 5 pièces jointes autorisées' })
    .optional(),
});

// Schéma pour mettre à jour le statut d'un litige (pour les administrateurs)
export const updateDisputeStatusSchema = z.object({
  status: z
    .nativeEnum(DisputeStatus, { 
      errorMap: () => ({ message: 'Statut de litige invalide' }) 
    }),
  
  comments: z
    .string()
    .max(1000, { message: 'Les commentaires ne peuvent pas dépasser 1000 caractères' })
    .optional(),
  
  resolution: z
    .string()
    .max(2000, { message: 'La résolution ne peut pas dépasser 2000 caractères' })
    .optional(),
  
  refundAmount: z
    .number()
    .int()
    .min(0, { message: 'Le montant de remboursement ne peut pas être négatif' })
    .optional(),
});

// Schéma pour mettre à jour un litige (par celui qui l'a créé)
export const updateDisputeSchema = z.object({
  description: z
    .string()
    .min(50, { message: 'La description doit contenir au moins 50 caractères' })
    .max(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
    .optional(),
  
  evidence: z
    .array(z.string())
    .max(10, { message: 'Maximum 10 preuves autorisées' })
    .optional(),
});

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreateDisputeDto = z.infer<typeof createDisputeSchema>;
export type AddDisputeMessageDto = z.infer<typeof addDisputeMessageSchema>;
export type UpdateDisputeStatusDto = z.infer<typeof updateDisputeStatusSchema>;
export type UpdateDisputeDto = z.infer<typeof updateDisputeSchema>; 