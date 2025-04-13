import { z } from 'zod';

// Définir d'abord le schéma sans le raffinement
const baseServiceSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Le titre doit contenir au moins 5 caractères' })
    .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' }),
  
  description: z
    .string()
    .min(100, { message: 'La description doit contenir au moins 100 caractères' })
    .max(5000, { message: 'La description ne peut pas dépasser 5000 caractères' }),
  
  categoryId: z
    .string()
    .uuid({ message: 'L\'ID de catégorie doit être un UUID valide' }),
  
  providerId: z
    .string()
    .uuid({ message: 'L\'ID du fournisseur doit être un UUID valide' }),
  
  tags: z
    .array(z.string())
    .min(1, { message: 'Au moins un tag est requis' })
    .max(10, { message: 'Maximum 10 tags autorisés' })
    .optional(),
  
  price: z
    .number()
    .int({ message: 'Le prix doit être un nombre entier' })
    .min(1000, { message: 'Le prix minimum est de 1000 FCFA' })
    .max(500000, { message: 'Le prix maximum est de 500000 FCFA' }),
  
  deliveryTime: z
    .number()
    .int({ message: 'Le délai de livraison doit être un nombre entier' })
    .min(1, { message: 'Le délai de livraison minimum est de 1 jour' })
    .max(90, { message: 'Le délai de livraison maximum est de 90 jours' }),
  
  isActive: z
    .boolean()
    .optional()
    .default(true),
  
  // Images des services (URLs)
  images: z
    .array(z.string().url({ message: 'URL d\'image invalide' }))
    .min(1, { message: 'Au moins une image est requise' })
    .max(10, { message: 'Maximum 10 images autorisées' })
    .optional(),
  
  // Options de service
  options: z
    .array(
      z.object({
        title: z.string().min(2, { message: 'Le titre de l\'option doit contenir au moins 2 caractères' }),
        description: z.string().optional(),
        price: z.number().int({ message: 'Le prix de l\'option doit être un nombre entier' }).min(0, { message: 'Le prix de l\'option ne peut pas être négatif' }),
      })
    )
    .optional(),
});

// Schéma pour la création avec règle de validation supplémentaire
export const createServiceSchema = baseServiceSchema.refine(data => {
  // Vérification supplémentaire pour s'assurer que l'ID du fournisseur est présent
  if (!data.providerId) {
    return false;
  }
  return true;
}, {
  message: "L'ID du fournisseur (providerId) est obligatoire",
  path: ["providerId"]
});

// Schéma pour la mise à jour (tous les champs optionnels)
export const updateServiceSchema = baseServiceSchema.partial();

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>; 