import { Message, Conversation } from '../types';

// Conversations vides pour la production
export const conversations: Conversation[] = [];

// Messages vides pour la production
export const messages: Message[] = [];

// Fonction utilitaire pour obtenir les messages d'une conversation
export const getMessagesByConversationId = (conversationId: string): Message[] => {
  return [];
};

// Fonction utilitaire pour obtenir une conversation par ID
export const getConversationById = (conversationId: string): Conversation | undefined => {
  return undefined;
};

// Fonction utilitaire pour obtenir les conversations d'un utilisateur
export const getConversationsByUserId = (userId: string): Conversation[] => {
  return [];
}; 