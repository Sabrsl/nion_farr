"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentGatewaySchema = exports.createPaymentGatewaySchema = void 0;
const zod_1 = require("zod");
const payment_gateway_type_enum_1 = require("../enums/payment-gateway-type.enum");
// Schéma de base pour la création d'une passerelle de paiement
exports.createPaymentGatewaySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
        .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
    type: zod_1.z
        .nativeEnum(payment_gateway_type_enum_1.PaymentGatewayType, {
        errorMap: () => ({ message: 'Type de passerelle de paiement invalide' })
    }),
    isActive: zod_1.z
        .boolean()
        .optional()
        .default(true),
    isSandbox: zod_1.z
        .boolean()
        .optional()
        .default(false),
    config: zod_1.z.object({
        apiKey: zod_1.z
            .string()
            .min(1, { message: 'Clé API requise' })
            .optional(),
        secretKey: zod_1.z
            .string()
            .min(1, { message: 'Clé secrète requise' })
            .optional(),
        merchantId: zod_1.z
            .string()
            .min(1, { message: 'ID de marchand requis' })
            .optional(),
        webhookSecret: zod_1.z
            .string()
            .min(1, { message: 'Secret de webhook requis' })
            .optional(),
        endpoint: zod_1.z
            .string()
            .url({ message: 'URL de point de terminaison invalide' })
            .optional(),
        callbackUrl: zod_1.z
            .string()
            .url({ message: 'URL de rappel invalide' })
            .optional(),
        additionalParams: zod_1.z
            .record(zod_1.z.any())
            .optional(),
    }).optional(),
    description: zod_1.z
        .string()
        .max(500, { message: 'La description ne peut pas dépasser 500 caractères' })
        .optional(),
    supportedMethods: zod_1.z
        .array(zod_1.z.string())
        .min(1, { message: 'Au moins une méthode de paiement prise en charge est requise' })
        .optional(),
    fee: zod_1.z
        .number()
        .min(0, { message: 'Les frais ne peuvent pas être négatifs' })
        .max(10000, { message: 'Les frais ne peuvent pas dépasser 10,000 FCFA' })
        .optional(),
    feePercent: zod_1.z
        .number()
        .min(0, { message: 'Le pourcentage de frais ne peut pas être négatif' })
        .max(100, { message: 'Le pourcentage de frais ne peut pas dépasser 100%' })
        .optional(),
});
// Schéma pour mettre à jour une passerelle de paiement (tous les champs sont optionnels)
exports.updatePaymentGatewaySchema = exports.createPaymentGatewaySchema.partial();
