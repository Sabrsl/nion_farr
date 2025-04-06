import { Message, Attachment, User } from '../types';

/**
 * Service dédié à la gestion des messages
 */
class MessageService {
  private apiUrl = '/api/messages';
  
  /**
   * Récupère les messages d'une conversation
   * @param conversationId ID de la conversation
   * @param page Numéro de page pour la pagination
   * @param limit Nombre de messages par page
   * @returns Liste des messages de la conversation
   */
  async getConversationMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{
    success: boolean;
    messages?: Message[];
    totalCount?: number;
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        // Importer les messages (vides pour la production)
        const { messages } = await import('../data/mockMessages');
        
        return {
          success: true,
          messages: [],
          totalCount: 0
        };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(
        `${this.apiUrl}?conversationId=${conversationId}&page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        messages: data.messages,
        totalCount: data.totalCount
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des messages:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la récupération des messages.'
      };
    }
  }
  
  /**
   * Récupère toutes les conversations d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Liste des conversations
   */
  async getUserConversations(userId: string): Promise<{
    success: boolean;
    conversations?: any[];
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        // Importer les conversations (vides pour la production)
        const { conversations } = await import('../data/mockMessages');
        
        return {
          success: true,
          conversations: []
        };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(`${this.apiUrl}/conversations?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        conversations: data.conversations
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la récupération des conversations.'
      };
    }
  }
  
  /**
   * Envoie un message dans une conversation
   * @param conversationId ID de la conversation
   * @param content Contenu du message
   * @param senderId ID de l'expéditeur
   * @param files Pièces jointes (optionnel)
   * @returns Le message créé
   */
  async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    files?: File[]
  ): Promise<{
    success: boolean;
    message?: Message;
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        // Créer un ID unique pour le message
        const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Créer un message avec les données fournies
        const newMessage: Message = {
          id: messageId,
          conversationId,
          content,
          senderId,
          isRead: false,
          createdAt: new Date().toISOString(),
          attachments: []
        };
        
        // Si on a des fichiers, les traiter
        if (files && files.length > 0) {
          // Simuler l'upload de fichiers
          const attachments: Attachment[] = [];
          
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const attachment: Attachment = {
              id: `att_${Date.now()}_${i}`,
              name: file.name,
              url: URL.createObjectURL(file),
              size: file.size,
              type: file.type.startsWith('image/') ? 'image' : 'document',
              originalName: file.name
            };
            
            attachments.push(attachment);
          }
          
          newMessage.attachments = attachments;
        }
        
        return {
          success: true,
          message: newMessage
        };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', content);
      formData.append('senderId', senderId);
      
      if (files && files.length > 0) {
        for (const file of files) {
          formData.append('files', file);
        }
      }
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        message: data.message
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de l\'envoi du message.'
      };
    }
  }
  
  /**
   * Marque un message comme lu
   * @param messageId ID du message
   * @param userId ID de l'utilisateur qui lit le message
   */
  async markMessageAsRead(
    messageId: string,
    userId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        return { success: true };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(`${this.apiUrl}/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors du marquage du message comme lu:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors du marquage du message comme lu.'
      };
    }
  }
  
  /**
   * Marque tous les messages d'une conversation comme lus pour un utilisateur
   * @param conversationId ID de la conversation
   * @param userId ID de l'utilisateur
   */
  async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        return { success: true };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(`${this.apiUrl}/conversation/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors du marquage de la conversation comme lue:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors du marquage de la conversation comme lue.'
      };
    }
  }
  
  /**
   * Crée un message temporaire pour l'affichage immédiat avant la confirmation de l'envoi
   * @param content Contenu du message
   * @param senderId ID de l'expéditeur
   * @param conversationId ID de la conversation
   * @param files Pièces jointes (optionnel)
   */
  createTemporaryMessage(
    content: string,
    senderId: string,
    conversationId: string,
    files?: File[]
  ): Message {
    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const tempMessage: Message = {
      id: tempId,
      content,
      senderId,
      conversationId,
      isRead: false,
      isTemporary: true,
      createdAt: new Date().toISOString(),
      attachments: []
    };
    
    // Si on a des fichiers, créer des URLs temporaires
    if (files && files.length > 0) {
      tempMessage.attachments = files.map((file, index) => ({
        id: `temp_att_${Date.now()}_${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        originalName: file.name
      }));
    }
    
    return tempMessage;
  }
  
  /**
   * Remplace un message temporaire par le message réel reçu du serveur
   * @param messages Liste actuelle des messages
   * @param tempId ID du message temporaire à remplacer
   * @param realMessage Message réel reçu du serveur
   */
  replaceTemporaryMessage(
    messages: Message[],
    tempId: string,
    realMessage: Message
  ): Message[] {
    return messages.map(msg => 
      msg.id === tempId ? { ...realMessage, isTemporary: false, isDelivered: true } : msg
    );
  }
  
  /**
   * Crée une nouvelle conversation entre deux utilisateurs
   * @param senderId ID de l'expéditeur
   * @param receiverId ID du destinataire
   * @param initialMessage Message initial
   * @param orderId ID de la commande associée (optionnel)
   * @returns La conversation créée et le message initial
   */
  async createConversation(
    senderId: string,
    receiverId: string,
    initialMessage: string,
    orderId?: string
  ): Promise<{
    success: boolean;
    conversation?: any;
    message?: Message;
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        // Générer des IDs uniques
        const conversationId = `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Créer une nouvelle conversation
        const newConversation = {
          id: conversationId,
          participants: [
            { id: senderId, role: 'client' },
            { id: receiverId, role: 'provider' }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderId,
          unreadCount: 0
        };
        
        // Créer le premier message
        const newMessage: Message = {
          id: messageId,
          conversationId,
          content: initialMessage,
          senderId,
          isRead: false,
          createdAt: new Date().toISOString(),
          attachments: []
        };
        
        return {
          success: true,
          conversation: newConversation,
          message: newMessage
        };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const payload = {
        senderId,
        receiverId,
        initialMessage,
        orderId
      };
      
      const response = await fetch(`${this.apiUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        conversation: data.conversation,
        message: data.message
      };
    } catch (error: any) {
      console.error('Erreur lors de la création de la conversation:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la création de la conversation.'
      };
    }
  }
}

// Exporter une instance unique du service
export const messageService = new MessageService();
export default messageService; 