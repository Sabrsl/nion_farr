"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessagesSchema = exports.markMessagesAsReadSchema = exports.createConversationSchema = exports.createMessageSchema = void 0;
const zod_1 = require("zod");
const message_type_enum_1 = require("../enums/message-type.enum");
// Schéma de base pour la création d'un message
exports.createMessageSchema = zod_1.z.object({
    conversationId: zod_1.z
        .string()
        .uuid({ message: 'ID de conversation invalide' })
        .optional(), // Optionnel si on crée une nouvelle conversation
    receiverId: zod_1.z
        .string()
        .uuid({ message: 'ID de destinataire invalide' }),
    content: zod_1.z
        .string()
        .min(1, { message: 'Le contenu ne peut pas être vide' })
        .max(5000, { message: 'Le contenu ne peut pas dépasser 5000 caractères' }),
    attachments: zod_1.z
        .array(zod_1.z.string())
        .max(10, { message: 'Maximum 10 pièces jointes autorisées' })
        .optional(),
    type: zod_1.z
        .nativeEnum(message_type_enum_1.MessageType, {
        errorMap: () => ({ message: 'Type de message invalide' })
    })
        .optional()
        .default(message_type_enum_1.MessageType.TEXT),
    orderId: zod_1.z
        .string()
        .uuid({ message: 'ID de commande invalide' })
        .optional(),
});
// Schéma pour créer une nouvelle conversation
exports.createConversationSchema = zod_1.z.object({
    participants: zod_1.z
        .array(zod_1.z.string().uuid({ message: 'ID de participant invalide' }))
        .min(1, { message: 'Au moins un participant est requis' })
        .max(10, { message: 'Maximum 10 participants autorisés' }),
    title: zod_1.z
        .string()
        .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
        .optional(),
    isOrderRelated: zod_1.z
        .boolean()
        .optional()
        .default(false),
    orderId: zod_1.z
        .string()
        .uuid({ message: 'ID de commande invalide' })
        .optional(),
});
// Schéma pour marquer des messages comme lus
exports.markMessagesAsReadSchema = zod_1.z.object({
    messageIds: zod_1.z
        .array(zod_1.z.string().uuid({ message: 'ID de message invalide' }))
        .min(1, { message: 'Au moins un ID de message est requis' }),
});
// Schéma pour supprimer des messages
exports.deleteMessagesSchema = zod_1.z.object({
    messageIds: zod_1.z
        .array(zod_1.z.string().uuid({ message: 'ID de message invalide' }))
        .min(1, { message: 'Au moins un ID de message est requis' }),
    deleteForEveryone: zod_1.z
        .boolean()
        .optional()
        .default(false),
});
