"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptOrderSchema = exports.cancelOrderSchema = exports.requestRevisionSchema = exports.updateOrderStatusSchema = exports.deliverOrderSchema = exports.updateOrderSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const order_status_enum_1 = require("../enums/order-status.enum");
// Schéma de base pour la création d'une commande
exports.createOrderSchema = zod_1.z.object({
    serviceId: zod_1.z
        .string()
        .uuid({ message: 'ID de service invalide' }),
    optionIds: zod_1.z
        .array(zod_1.z.string().uuid({ message: 'ID d\'option invalide' }))
        .optional(),
    requirements: zod_1.z
        .string()
        .min(10, { message: 'Les exigences doivent contenir au moins 10 caractères' })
        .max(5000, { message: 'Les exigences ne peuvent pas dépasser 5000 caractères' }),
    attachments: zod_1.z
        .array(zod_1.z.string())
        .max(10, { message: 'Maximum 10 pièces jointes autorisées' })
        .optional(),
});
// Schéma pour mettre à jour une commande (pour un client)
exports.updateOrderSchema = zod_1.z.object({
    requirements: zod_1.z
        .string()
        .min(10, { message: 'Les exigences doivent contenir au moins 10 caractères' })
        .max(5000, { message: 'Les exigences ne peuvent pas dépasser 5000 caractères' })
        .optional(),
    attachments: zod_1.z
        .array(zod_1.z.string())
        .max(10, { message: 'Maximum 10 pièces jointes autorisées' })
        .optional(),
});
// Schéma pour livrer une commande (pour un prestataire)
exports.deliverOrderSchema = zod_1.z.object({
    deliveryMessage: zod_1.z
        .string()
        .min(10, { message: 'Le message de livraison doit contenir au moins 10 caractères' })
        .max(2000, { message: 'Le message de livraison ne peut pas dépasser 2000 caractères' }),
    deliveryFiles: zod_1.z
        .array(zod_1.z.string())
        .min(1, { message: 'Au moins un fichier de livraison est requis' })
        .max(20, { message: 'Maximum 20 fichiers de livraison autorisés' }),
});
// Schéma pour mettre à jour le statut d'une commande (pour les administrateurs)
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z
        .nativeEnum(order_status_enum_1.OrderStatus, {
        errorMap: () => ({ message: 'Statut de commande invalide' })
    }),
    reason: zod_1.z
        .string()
        .max(500, { message: 'La raison ne peut pas dépasser 500 caractères' })
        .optional(),
});
// Schéma pour demander une révision (pour un client)
exports.requestRevisionSchema = zod_1.z.object({
    revisionMessage: zod_1.z
        .string()
        .min(10, { message: 'Le message de révision doit contenir au moins 10 caractères' })
        .max(2000, { message: 'Le message de révision ne peut pas dépasser 2000 caractères' }),
    revisionDetails: zod_1.z
        .array(zod_1.z.string())
        .min(1, { message: 'Au moins un point de révision est requis' })
        .max(10, { message: 'Maximum 10 points de révision autorisés' }),
    attachments: zod_1.z
        .array(zod_1.z.string())
        .max(5, { message: 'Maximum 5 pièces jointes autorisées' })
        .optional(),
});
// Schéma pour annuler une commande
exports.cancelOrderSchema = zod_1.z.object({
    cancelReason: zod_1.z
        .string()
        .min(10, { message: 'La raison d\'annulation doit contenir au moins 10 caractères' })
        .max(500, { message: 'La raison d\'annulation ne peut pas dépasser 500 caractères' }),
});
// Schéma pour accepter une commande (pour un prestataire)
exports.acceptOrderSchema = zod_1.z.object({
    startDate: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Format de date de début invalide'
    })
        .optional(),
    estimatedCompletionDate: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Format de date d\'achèvement estimée invalide'
    })
        .optional(),
});
