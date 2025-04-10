"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewSchema = exports.reportReviewSchema = exports.respondToReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
// Schéma de base pour la création d'un avis
exports.createReviewSchema = zod_1.z.object({
    orderId: zod_1.z
        .string()
        .uuid({ message: 'ID de commande invalide' }),
    rating: zod_1.z
        .number()
        .int()
        .min(1, { message: 'La note minimale est de 1' })
        .max(5, { message: 'La note maximale est de 5' }),
    comment: zod_1.z
        .string()
        .min(10, { message: 'Le commentaire doit contenir au moins 10 caractères' })
        .max(1000, { message: 'Le commentaire ne peut pas dépasser 1000 caractères' })
        .optional(),
    isAnonymous: zod_1.z
        .boolean()
        .optional()
        .default(false),
});
// Schéma pour répondre à un avis (en tant que prestataire)
exports.respondToReviewSchema = zod_1.z.object({
    response: zod_1.z
        .string()
        .min(10, { message: 'La réponse doit contenir au moins 10 caractères' })
        .max(500, { message: 'La réponse ne peut pas dépasser 500 caractères' }),
});
// Schéma pour signaler un avis (rapport d'abus)
exports.reportReviewSchema = zod_1.z.object({
    reason: zod_1.z
        .string()
        .min(10, { message: 'La raison doit contenir au moins 10 caractères' })
        .max(500, { message: 'La raison ne peut pas dépasser 500 caractères' }),
    details: zod_1.z
        .string()
        .max(1000, { message: 'Les détails ne peuvent pas dépasser 1000 caractères' })
        .optional(),
});
// Schéma pour mettre à jour un avis (par l'auteur)
exports.updateReviewSchema = zod_1.z.object({
    rating: zod_1.z
        .number()
        .int()
        .min(1, { message: 'La note minimale est de 1' })
        .max(5, { message: 'La note maximale est de 5' })
        .optional(),
    comment: zod_1.z
        .string()
        .min(10, { message: 'Le commentaire doit contenir au moins 10 caractères' })
        .max(1000, { message: 'Le commentaire ne peut pas dépasser 1000 caractères' })
        .optional(),
    isAnonymous: zod_1.z
        .boolean()
        .optional(),
});
