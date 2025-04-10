"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDisputeSchema = exports.updateDisputeStatusSchema = exports.addDisputeMessageSchema = exports.createDisputeSchema = void 0;
const zod_1 = require("zod");
const dispute_schema_1 = require("./dispute.schema");
// Schéma de base pour la création d'un litige
exports.createDisputeSchema = zod_1.z.object({
    orderId: zod_1.z
        .string()
        .uuid({ message: 'ID de commande invalide' }),
    reason: zod_1.z
        .nativeEnum(dispute_schema_1.DisputeReason, {
        errorMap: () => ({ message: 'Raison de litige invalide' })
    }),
    description: zod_1.z
        .string()
        .min(50, { message: 'La description doit contenir au moins 50 caractères' })
        .max(2000, { message: 'La description ne peut pas dépasser 2000 caractères' }),
    evidence: zod_1.z
        .array(zod_1.z.string())
        .max(10, { message: 'Maximum 10 preuves autorisées' })
        .optional(),
});
// Schéma pour ajouter un message à un litige
exports.addDisputeMessageSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(1, { message: 'Le contenu ne peut pas être vide' })
        .max(2000, { message: 'Le contenu ne peut pas dépasser 2000 caractères' }),
    attachments: zod_1.z
        .array(zod_1.z.string())
        .max(5, { message: 'Maximum 5 pièces jointes autorisées' })
        .optional(),
});
// Schéma pour mettre à jour le statut d'un litige (pour les administrateurs)
exports.updateDisputeStatusSchema = zod_1.z.object({
    status: zod_1.z
        .nativeEnum(dispute_schema_1.DisputeStatus, {
        errorMap: () => ({ message: 'Statut de litige invalide' })
    }),
    comments: zod_1.z
        .string()
        .max(1000, { message: 'Les commentaires ne peuvent pas dépasser 1000 caractères' })
        .optional(),
    resolution: zod_1.z
        .string()
        .max(2000, { message: 'La résolution ne peut pas dépasser 2000 caractères' })
        .optional(),
    refundAmount: zod_1.z
        .number()
        .int()
        .min(0, { message: 'Le montant de remboursement ne peut pas être négatif' })
        .optional(),
});
// Schéma pour mettre à jour un litige (par celui qui l'a créé)
exports.updateDisputeSchema = zod_1.z.object({
    description: zod_1.z
        .string()
        .min(50, { message: 'La description doit contenir au moins 50 caractères' })
        .max(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
        .optional(),
    evidence: zod_1.z
        .array(zod_1.z.string())
        .max(10, { message: 'Maximum 10 preuves autorisées' })
        .optional(),
});
