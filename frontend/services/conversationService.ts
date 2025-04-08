import { Conversation, Message, User } from '../types';

/**
 * Service dédié à la gestion des conversations entre utilisateurs
 */
class ConversationService {
  private apiUrl = '/api/conversations';
  
  /**
   * Récupère toutes les conversations d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param includeArchived Inclure les conversations archivées
   * @returns Liste des conversations de l'utilisateur
   */
  async getUserConversations(
    userId: string,
    includeArchived = false
  ): Promise<{
    success: boolean;
    conversations?: Conversation[];
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo, utiliser alors les données mockées
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        console.log("API Mocking enabled, returning mock data for user", userId);
        // Récupérer depuis le localStorage pour la persistance entre les rafraîchissements
        const storedConversations = localStorage.getItem('userConversations');
        let conversations = [];
        
        if (storedConversations) {
          conversations = JSON.parse(storedConversations);
        } else {
          // Utiliser des données mock
          const mockConversations = [];
          const mockMessages = [];
          const mockUsers = [];
          conversations = mockConversations;
          
          // Stocker dans localStorage pour la persistance
          localStorage.setItem('userConversations', JSON.stringify(mockConversations));
        }
        
        // Filtrer pour ne garder que les conversations où l'utilisateur est participant
        const userConversations = conversations.filter((conversation: Conversation) => {
          return conversation.participants.some((participant: any) => 
            participant.id === userId || 
            (typeof participant === 'string' && participant === userId)
          );
        });
        
        // Améliorer les données des conversations avec les derniers messages et informations supplémentaires
        const enhancedConversations = await Promise.all(userConversations.map(async (conv: any) => {
          // Obtenir les messages de cette conversation
          const storedMessages = localStorage.getItem(`messages_${conv.id}`);
          let messages = [];
          
          if (storedMessages) {
            messages = JSON.parse(storedMessages);
          } else {
            // Si pas de messages dans localStorage, chercher dans les données mockées
            const mockMessages = [];
            messages = mockMessages.filter((msg: any) => msg.conversation === conv.id || msg.conversationId === conv.id);
            
            if (messages.length > 0) {
              // Sauvegarder dans localStorage pour utilisation future
              localStorage.setItem(`messages_${conv.id}`, JSON.stringify(messages));
            }
          }
          
          // Déterminer le rôle de l'utilisateur dans cette conversation (client ou vendeur)
          const isProvider = conv.participants.some((p: any) => 
            (typeof p === 'object' && p.id === userId && p.role === 'provider')
          );
          
          // Trouver l'autre participant
          const otherParticipant = conv.participants.find((p: any) => 
            (typeof p === 'object' && p.id !== userId) || 
            (typeof p === 'string' && p !== userId)
          );
          
          let otherUser = otherParticipant;
          if (typeof otherParticipant === 'string') {
            // Chercher les détails de l'utilisateur si on n'a que son ID
            const mockUsers = [];
            otherUser = mockUsers.find((u: any) => u.id === otherParticipant) || { id: otherParticipant, name: `User ${otherParticipant}` };
          }
          
          // Si c'est une conversation liée à une commande, récupérer les détails
          let orderDetails = conv.order;
          if (conv.orderId && !orderDetails) {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
              const orders = JSON.parse(storedOrders);
              orderDetails = orders.find((o: any) => o.id === conv.orderId);
            }
          }
          
          // Trier les messages par date pour trouver le plus récent
          if (messages.length > 0) {
            messages.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            // Calculer le nombre de messages non lus
            const unreadCount = messages.filter((msg: any) => 
              !msg.isRead && 
              ((typeof msg.senderId === 'string' && msg.senderId !== userId) ||
               (typeof msg.sender === 'object' && msg.sender.id !== userId))
            ).length;
            
            return {
              ...conv,
              userRole: isProvider ? 'provider' : 'client',
              otherParticipant: otherUser,
              sellerName: isProvider ? null : (otherUser.name || 'Vendeur'),
              clientName: isProvider ? (otherUser.name || 'Client') : null,
              lastMessage: {
                content: messages[0].content,
                createdAt: messages[0].createdAt,
                timestamp: new Date(messages[0].createdAt),
                senderId: messages[0].senderId || (messages[0].sender ? messages[0].sender.id : 'unknown'),
                senderType: (messages[0].senderId === userId || (messages[0].sender && messages[0].sender.id === userId)) 
                  ? 'self' 
                  : 'other'
              },
              unreadCount: unreadCount,
              order: orderDetails
            };
          }
          
          // Si pas de messages, retourner les données de base
          return {
            ...conv,
            userRole: isProvider ? 'provider' : 'client',
            otherParticipant: otherUser,
            sellerName: isProvider ? null : (otherUser.name || 'Vendeur'),
            clientName: isProvider ? (otherUser.name || 'Client') : null,
            unreadCount: 0,
            order: orderDetails
          };
        }));
        
        // Filtrer selon le statut d'archivage si demandé
        const filteredConversations = includeArchived 
          ? enhancedConversations 
          : enhancedConversations.filter((conv: Conversation) => conv.isActive !== false);
        
        // Trier par date du dernier message (plus récent en premier)
        filteredConversations.sort((a: any, b: any) => {
          const dateA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp) : new Date(a.updatedAt || 0);
          const dateB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp) : new Date(b.updatedAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        return {
          success: true,
          conversations: filteredConversations
        };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(
        `${this.apiUrl}?userId=${userId}&includeArchived=${includeArchived}`
      );
      
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
   * Crée une nouvelle conversation entre deux utilisateurs
   * @param participants IDs des participants à la conversation
   * @param initialMessage Message initial optionnel
   * @param orderId ID de la commande associée optionnel
   * @returns La nouvelle conversation créée
   */
  async createConversation(
    participants: string[],
    initialMessage?: string,
    orderId?: string
  ): Promise<{
    success: boolean;
    conversation?: Conversation;
    error?: string;
  }> {
    try {
      // Vérifier qu'il y a au moins 2 participants
      if (!participants || participants.length < 2) {
        return {
          success: false,
          error: 'Une conversation doit avoir au moins 2 participants.'
        };
      }
      
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        console.log("API Mocking enabled, creating mock conversation");
        
        // Récupérer les données utilisateurs pour les participants
        const mockUsers = [];
        
        // Trouver les objets utilisateurs correspondants
        const participantUsers = participants.map(id => {
          const user = mockUsers.find(u => u.id === id);
          return user || { id, name: `User ${id}`, username: `user_${id}`, role: 'client', isVerified: false };
        });
        
        // Créer une nouvelle conversation
        const newConversation: Conversation = {
          id: `CONV-${Date.now()}`,
          participants: participantUsers,
          lastMessage: initialMessage ? {
            content: initialMessage,
            createdAt: new Date().toISOString()
          } : undefined,
          unreadCount: 0,
          orderId: orderId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          order: orderId ? {
            id: orderId,
            title: 'Nouvelle commande',
            status: 'pending'
          } : undefined
        };
        
        // Ajouter à la liste des conversations existantes
        const storedConversations = localStorage.getItem('userConversations');
        let allConversations = [];
        
        if (storedConversations) {
          allConversations = JSON.parse(storedConversations);
        } else {
          const mockConversations = [];
          allConversations = mockConversations;
        }
        
        // Vérifier si une conversation entre ces mêmes participants existe déjà
        const existingConvIndex = allConversations.findIndex((conv: Conversation) => {
          // Si même nombre de participants et tous les IDs correspondent
          return conv.participants.length === participants.length &&
            participants.every(id => 
              conv.participants.some((p: any) => 
                (typeof p === 'string' && p === id) || 
                (typeof p === 'object' && p.id === id)
              )
            );
        });
        
        if (existingConvIndex >= 0) {
          // Mettre à jour la conversation existante
          allConversations[existingConvIndex] = {
            ...allConversations[existingConvIndex],
            lastMessage: initialMessage ? {
              content: initialMessage,
              createdAt: new Date().toISOString()
            } : allConversations[existingConvIndex].lastMessage,
            updatedAt: new Date().toISOString()
          };
          
          // Enregistrer dans localStorage
          localStorage.setItem('userConversations', JSON.stringify(allConversations));
          
          return {
            success: true,
            conversation: allConversations[existingConvIndex]
          };
        }
        
        // Ajouter la nouvelle conversation
        allConversations.unshift(newConversation);
        localStorage.setItem('userConversations', JSON.stringify(allConversations));
        
        return {
          success: true,
          conversation: newConversation
        };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants,
          initialMessage,
          orderId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        conversation: data.conversation
      };
    } catch (error: any) {
      console.error('Erreur lors de la création de la conversation:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la création de la conversation.'
      };
    }
  }

  /**
   * Récupère les détails d'une conversation spécifique
   * @param conversationId ID de la conversation
   * @returns Détails de la conversation
   */
  async getConversationDetails(
    conversationId: string
  ): Promise<{
    success: boolean;
    conversation?: Conversation;
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        console.log("API Mocking enabled, returning mock conversation details");
        
        // Récupérer depuis le localStorage
        const storedConversations = localStorage.getItem('userConversations');
        let conversations = [];
        
        if (storedConversations) {
          conversations = JSON.parse(storedConversations);
        } else {
          const mockConversations = [];
          conversations = mockConversations;
        }
        
        // Trouver la conversation spécifique
        const conversation = conversations.find((conv: Conversation) => conv.id === conversationId);
        
        if (!conversation) {
          return {
            success: false,
            error: 'Conversation non trouvée.'
          };
        }
        
        return {
          success: true,
          conversation
        };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(`${this.apiUrl}/${conversationId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        conversation: data.conversation
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des détails de la conversation:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la récupération des détails de la conversation.'
      };
    }
  }
  
  /**
   * Archive/désarchive une conversation
   * @param conversationId ID de la conversation
   * @param archive true pour archiver, false pour désarchiver
   */
  async toggleArchiveConversation(
    conversationId: string,
    archive: boolean
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Vérifier si on est en mode développement/démo
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' || !this.apiUrl) {
        console.log("API Mocking enabled, toggling mock conversation archive status");
        
        // Récupérer depuis le localStorage
        const storedConversations = localStorage.getItem('userConversations');
        let conversations = [];
        
        if (storedConversations) {
          conversations = JSON.parse(storedConversations);
        } else {
          const mockConversations = [];
          conversations = mockConversations;
        }
        
        // Trouver et mettre à jour la conversation
        const conversationIndex = conversations.findIndex((conv: Conversation) => conv.id === conversationId);
        
        if (conversationIndex === -1) {
          return {
            success: false,
            error: 'Conversation non trouvée.'
          };
        }
        
        conversations[conversationIndex].isActive = !archive;
        
        // Enregistrer les modifications
        localStorage.setItem('userConversations', JSON.stringify(conversations));
        
        return { success: true };
      }
      
      // Si on est en mode production, appeler l'API réelle
      const response = await fetch(`${this.apiUrl}/${conversationId}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ archive })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la modification du statut d\'archive de la conversation:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la modification du statut d\'archive de la conversation.'
      };
    }
  }
}

// Exporter une instance unique du service
export const conversationService = new ConversationService();
export default conversationService; 