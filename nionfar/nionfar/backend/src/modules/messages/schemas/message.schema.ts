import { z } from 'zod';
import { MessageType } from '../enums/message-type.enum';

// Schéma de base pour la création d'un message
export const createMessageSchema = z.object({
  conversationId: z
    .string()
    .uuid({ message: 'ID de conversation invalide' })
    .optional(), // Optionnel si on crée une nouvelle conversation
  
  receiverId: z
    .string()
    .uuid({ message: 'ID de destinataire invalide' }),
  
  content: z
    .string()
    .min(1, { message: 'Le contenu ne peut pas être vide' })
    .max(5000, { message: 'Le contenu ne peut pas dépasser 5000 caractères' }),
  
  attachments: z
    .array(z.string())
    .max(10, { message: 'Maximum 10 pièces jointes autorisées' })
    .optional(),
  
  type: z
    .nativeEnum(MessageType, { 
      errorMap: () => ({ message: 'Type de message invalide' }) 
    })
    .optional()
    .default(MessageType.TEXT),
  
  orderId: z
    .string()
    .uuid({ message: 'ID de commande invalide' })
    .optional(),
});

// Schéma pour créer une nouvelle conversation
export const createConversationSchema = z.object({
  participants: z
    .array(z.string().uuid({ message: 'ID de participant invalide' }))
    .min(1, { message: 'Au moins un participant est requis' })
    .max(10, { message: 'Maximum 10 participants autorisés' }),
  
  title: z
    .string()
    .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
    .optional(),
  
  isOrderRelated: z
    .boolean()
    .optional()
    .default(false),
  
  orderId: z
    .string()
    .uuid({ message: 'ID de commande invalide' })
    .optional(),
});

// Schéma pour marquer des messages comme lus
export const markMessagesAsReadSchema = z.object({
  messageIds: z
    .array(z.string().uuid({ message: 'ID de message invalide' }))
    .min(1, { message: 'Au moins un ID de message est requis' }),
});

// Schéma pour supprimer des messages
export const deleteMessagesSchema = z.object({
  messageIds: z
    .array(z.string().uuid({ message: 'ID de message invalide' }))
    .min(1, { message: 'Au moins un ID de message est requis' }),
  
  deleteForEveryone: z
    .boolean()
    .optional()
    .default(false),
});

// Types dérivés des schémas pour une utilisation dans TypeScript
export type CreateMessageDto = z.infer<typeof createMessageSchema>;
export type CreateConversationDto = z.infer<typeof createConversationSchema>;
export type MarkMessagesAsReadDto = z.infer<typeof markMessagesAsReadSchema>;
export type DeleteMessagesDto = z.infer<typeof deleteMessagesSchema>; 