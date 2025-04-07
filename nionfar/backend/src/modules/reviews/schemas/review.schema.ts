import { z } from 'zod';

// Schéma de base pour la création d'un avis
export const createReviewSchema = z.object({
  orderId: z
    .string()
    .uuid({ message: 'ID de commande invalide' }),
  
  rating: z
    .number()
    .int()
    .min(1, { message: 'La note minimale est de 1' })
    .max(5, { message: 'La note maximale est de 5' }),
  
  comment: z
    .string()
    .min(10, { message: 'Le commentaire doit contenir au moins 10 caractères' })
    .max(1000, { message: 'Le commentaire ne peut pas dépasser 1000 caractères' })
    .optional(),
  
  isAnonymous: z
    .boolean()
    .optional()
    .default(false),
});

// Schéma pour répondre à un avis (en tant que prestataire)
export const respondToReviewSchema = z.object({
  response: z
    .string()
    .min(10, { message: 'La réponse doit contenir au moins 10 caractères' })
    .max(500, { message: 'La réponse ne peut pas dépasser 500 caractères' }),
});

// Schéma pour signaler un avis (rapport d'abus)
export const reportReviewSchema = z.object({
  reason: z
    .string()
    .min(10, { message: 'La raison doit contenir au moins 10 caractères' })
    .max(500, { message: 'La raison ne peut pas dépasser 500 caractères' }),
  
  details: z
    .string()
    .max(1000, { message: 'Les détails ne peuvent pas dépasser 1000 caractères' })
    .optional(),
});

// Schéma pour mettre à jour un avis (par l'auteur)
export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: 'La note minimale est de 1' })
    .max(5, { message: 'La note maximale est de 5' })
    .optional(),
  
  comment: z
    .string()
    .min(10, { message: 'Le commentaire doit contenir au moins 10 caractères' })
    .max(1000, { message: 'Le commentaire ne peut pas dépasser 1000 caractères' })
    .optional(),
  
  isAnonymous: z
    .boolean()
    .optional(),
});

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type RespondToReviewDto = z.infer<typeof respondToReviewSchema>;
export type ReportReviewDto = z.infer<typeof reportReviewSchema>;
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>; 