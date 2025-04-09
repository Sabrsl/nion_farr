import { Conversation, Message, User } from '../types';
import { API_BASE_URL } from '../config';

/**
 * Service pour gérer les conversations entre utilisateurs
 */
class ConversationService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${API_BASE_URL}/conversations`;
  }

  /**
   * Récupère les conversations d'un utilisateur
   */
  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`${this.apiUrl}/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  /**
   * Récupère les messages d'une conversation
   */
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${this.apiUrl}/${conversationId}/messages`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  /**
   * Récupère les profils des utilisateurs pour les conversations
   */
  async getUserProfiles(userIds: string[]): Promise<User[]> {
    try {
      // Construire la requête avec les IDs en paramètre
      const queryParams = userIds.map(id => `ids[]=${id}`).join('&');
      const response = await fetch(`${API_BASE_URL}/users/profiles?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des profils:', error);
      return [];
    }
  }

  /**
   * Envoie un message dans une conversation
   */
  async sendMessage(conversationId: string, message: Partial<Message>): Promise<Message | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.message || null;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle conversation
   */
  async createConversation(participants: string[], initialMessage?: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`${this.apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants,
          initialMessage
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.conversation || null;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      return null;
    }
  }

  /**
   * Marque les messages comme lus
   */
  async markAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
      return false;
    }
  }
}

export const conversationService = new ConversationService(); 