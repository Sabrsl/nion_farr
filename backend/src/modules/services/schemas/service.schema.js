"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceSchema = exports.createServiceSchema = void 0;
const zod_1 = require("zod");
// Schéma de base pour la création de service
exports.createServiceSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(5, { message: 'Le titre doit contenir au moins 5 caractères' })
        .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' }),
    description: zod_1.z
        .string()
        .min(1000, { message: 'La description doit contenir au moins 1000 caractères' })
        .max(5000, { message: 'La description ne peut pas dépasser 5000 caractères' }),
    category: zod_1.z
        .string()
        .min(2, { message: 'La catégorie doit contenir au moins 2 caractères' }),
    tags: zod_1.z
        .array(zod_1.z.string())
        .min(1, { message: 'Au moins un tag est requis' })
        .max(10, { message: 'Maximum 10 tags autorisés' })
        .optional(),
    price: zod_1.z
        .number()
        .min(1000, { message: 'Le prix minimum est de 1000 FCFA' })
        .max(500000, { message: 'Le prix maximum est de 500000 FCFA' }),
    deliveryTime: zod_1.z
        .number()
        .int()
        .min(1, { message: 'Le délai de livraison minimum est de 1 jour' })
        .max(90, { message: 'Le délai de livraison maximum est de 90 jours' }),
    isActive: zod_1.z
        .boolean()
        .optional()
        .default(true),
    // Champs optionnels
    options: zod_1.z
        .array(zod_1.z.object({
        title: zod_1.z.string().min(2),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().min(0),
    }))
        .optional(),
});
// Schéma pour la mise à jour de service (tous les champs sont optionnels)
exports.updateServiceSchema = exports.createServiceSchema.partial();
