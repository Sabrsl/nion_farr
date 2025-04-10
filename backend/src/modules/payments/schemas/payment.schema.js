"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionSchema = exports.withdrawalSchema = exports.updatePaymentStatusSchema = exports.paymentWebhookSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
const payment_method_enum_1 = require("../enums/payment-method.enum");
const payment_type_enum_1 = require("../enums/payment-type.enum");
const payment_status_enum_1 = require("../enums/payment-status.enum");
// Schéma de base pour la création d'un paiement
exports.createPaymentSchema = zod_1.z.object({
    orderId: zod_1.z
        .string()
        .uuid({ message: 'ID de commande invalide' }),
    amount: zod_1.z
        .number()
        .int()
        .min(100, { message: 'Le montant minimum est de 100 FCFA' })
        .max(10000000, { message: 'Le montant maximum est de 10,000,000 FCFA' }),
    method: zod_1.z
        .nativeEnum(payment_method_enum_1.PaymentMethod, {
        errorMap: () => ({ message: 'Méthode de paiement invalide' })
    }),
    type: zod_1.z
        .nativeEnum(payment_type_enum_1.PaymentType, {
        errorMap: () => ({ message: 'Type de paiement invalide' })
    }),
    description: zod_1.z
        .string()
        .max(255, { message: 'La description ne peut pas dépasser 255 caractères' })
        .optional(),
    metadata: zod_1.z
        .record(zod_1.z.any())
        .optional(),
});
// Schéma pour le rappel (webhook) de paiement
exports.paymentWebhookSchema = zod_1.z.object({
    transactionId: zod_1.z
        .string()
        .min(1, { message: 'ID de transaction requis' }),
    providerTransactionId: zod_1.z
        .string()
        .min(1, { message: 'ID de transaction du fournisseur requis' }),
    status: zod_1.z
        .nativeEnum(payment_status_enum_1.PaymentStatus, {
        errorMap: () => ({ message: 'Statut de paiement invalide' })
    }),
    amount: zod_1.z
        .number()
        .int()
        .min(100, { message: 'Le montant minimum est de 100 FCFA' }),
    providerResponse: zod_1.z
        .record(zod_1.z.any())
        .optional(),
    metadata: zod_1.z
        .record(zod_1.z.any())
        .optional(),
});
// Schéma pour mettre à jour le statut d'un paiement (pour les administrateurs)
exports.updatePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z
        .nativeEnum(payment_status_enum_1.PaymentStatus, {
        errorMap: () => ({ message: 'Statut de paiement invalide' })
    }),
    reason: zod_1.z
        .string()
        .max(255, { message: 'La raison ne peut pas dépasser 255 caractères' })
        .optional(),
});
// Schéma pour le retrait d'argent
exports.withdrawalSchema = zod_1.z.object({
    amount: zod_1.z
        .number()
        .int()
        .min(5000, { message: 'Le montant minimum de retrait est de 5000 FCFA' })
        .max(1000000, { message: 'Le montant maximum de retrait est de 1,000,000 FCFA' }),
    method: zod_1.z
        .nativeEnum(payment_method_enum_1.PaymentMethod, {
        errorMap: () => ({ message: 'Méthode de retrait invalide' })
    }),
    accountDetails: zod_1.z
        .record(zod_1.z.string())
        .refine((data) => {
        if (data.accountNumber && data.accountNumber.length < 5) {
            return false;
        }
        return true;
    }, {
        message: 'Détails du compte invalides',
        path: ['accountDetails'],
    }),
    description: zod_1.z
        .string()
        .max(255, { message: 'La description ne peut pas dépasser 255 caractères' })
        .optional(),
});
// Schéma pour les transactions
exports.transactionSchema = zod_1.z.object({
    userId: zod_1.z
        .string()
        .uuid({ message: 'ID d\'utilisateur invalide' }),
    amount: zod_1.z
        .number()
        .int()
        .min(100, { message: 'Le montant minimum est de 100 FCFA' }),
    type: zod_1.z
        .nativeEnum(payment_type_enum_1.PaymentType, {
        errorMap: () => ({ message: 'Type de transaction invalide' })
    }),
    description: zod_1.z
        .string()
        .max(255, { message: 'La description ne peut pas dépasser 255 caractères' })
        .optional(),
    orderId: zod_1.z
        .string()
        .uuid({ message: 'ID de commande invalide' })
        .optional(),
    metadata: zod_1.z
        .record(zod_1.z.any())
        .optional(),
});
