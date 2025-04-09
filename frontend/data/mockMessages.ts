import { Message, Conversation } from '../types';

/**
 * Fichier de données nettoyé pour l'environnement de production.
 * Toutes les données moquées ont été remplacées par des tableaux vides
 * et des fonctions qui renvoient des valeurs par défaut.
 */

// Conversations vides pour la production
export const conversations: Conversation[] = [];

// Messages vides pour la production
export const messages: Message[] = [];

// Fonction qui retourne un tableau vide
export const getMessagesByConversationId = (conversationId: string): Message[] => {
  return [];
};

// Fonction qui retourne undefined
export const getConversationById = (conversationId: string): Conversation | undefined => {
  return undefined;
};

// Fonction qui retourne un tableau vide
export const getConversationsByUserId = (userId: string): Conversation[] => {
  return [];
}; 