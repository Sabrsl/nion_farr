import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, User } from '../types';
import { conversationService } from '../services/conversationService';
import { messageService } from '../services/messageService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personnalisé pour gérer les conversations et les messages
 */
export const useConversations = () => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState({
    conversations: false,
    messages: false,
    sending: false
  });
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  
  /**
   * Récupère toutes les conversations de l'utilisateur courant
   */
  const fetchConversations = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    
    setLoading(prev => ({ ...prev, conversations: true }));
    setError(null);
    
    try {
      const result = await conversationService.getUserConversations(user.id);
      
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      } else {
        setError(result.error || 'Erreur lors de la récupération des conversations');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  }, [user, isAuthenticated]);
  
  /**
   * Récupère les messages d'une conversation spécifique
   */
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user || !isAuthenticated) return;
    
    setLoading(prev => ({ ...prev, messages: true }));
    setError(null);
    
    try {
      const result = await messageService.getConversationMessages(conversationId);
      
      if (result.success && result.messages) {
        setMessages(result.messages);
      } else {
        setError(result.error || 'Erreur lors de la récupération des messages');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, [user, isAuthenticated]);
  
  /**
   * Crée une nouvelle conversation avec un autre utilisateur
   */
  const createConversation = useCallback(async (
    recipientId: string,
    initialMessage?: string,
    orderId?: string
  ) => {
    if (!user || !isAuthenticated) return null;
    
    setLoading(prev => ({ ...prev, sending: true }));
    setError(null);
    
    try {
      // Les participants sont l'utilisateur courant et le destinataire
      const participants = [user.id, recipientId];
      
      const result = await conversationService.createConversation(
        participants,
        initialMessage,
        orderId
      );
      
      if (result.success && result.conversation) {
        // Ajouter la nouvelle conversation à la liste
        setConversations(prev => [result.conversation!, ...prev]);
        
        // Définir comme conversation active
        setActiveConversation(result.conversation);
        
        // Si un message initial a été envoyé, le récupérer
        if (initialMessage) {
          await fetchMessages(result.conversation.id);
        }
        
        return result.conversation;
      } else {
        setError(result.error || 'Erreur lors de la création de la conversation');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  }, [user, isAuthenticated, fetchMessages]);
  
  /**
   * Envoie un message dans la conversation active
   */
  const sendMessage = useCallback(async (
    content: string,
    files?: File[]
  ) => {
    if (!user || !isAuthenticated || !activeConversation) return null;
    
    setLoading(prev => ({ ...prev, sending: true }));
    setError(null);
    
    try {
      // Créer un message temporaire pour l'UI
      const tempMessage = messageService.createTemporaryMessage(
        content,
        user.id,
        activeConversation.id,
        files
      );
      
      // Ajouter immédiatement le message temporaire à l'UI
      setMessages(prev => [...prev, tempMessage]);
      
      // Envoyer le message au serveur
      const result = await messageService.sendMessage(
        activeConversation.id,
        content,
        user.id,
        files
      );
      
      if (result.success && result.message) {
        // Remplacer le message temporaire par le message réel
        setMessages(prev => 
          messageService.replaceTemporaryMessage(prev, tempMessage.id, result.message!)
        );
        
        // Mettre à jour le dernier message envoyé
        setLastMessage(result.message);
        
        // Mettre à jour la conversation avec le dernier message
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === activeConversation.id) {
              return {
                ...conv,
                lastMessage: {
                  content,
                  createdAt: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
              };
            }
            return conv;
          });
        });
        
        return result.message;
      } else {
        // En cas d'erreur, supprimer le message temporaire
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setError(result.error || 'Erreur lors de l\'envoi du message');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  }, [user, isAuthenticated, activeConversation]);
  
  /**
   * Marque tous les messages d'une conversation comme lus
   */
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!user || !isAuthenticated) return;
    
    try {
      await messageService.markConversationAsRead(conversationId, user.id);
      
      // Mettre à jour le compteur de messages non lus dans l'UI
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: 0
            };
          }
          return conv;
        });
      });
      
      // Mettre à jour les messages dans l'UI
      setMessages(prev => {
        return prev.map(msg => {
          // Ne marquer comme lus que les messages envoyés à l'utilisateur courant
          if (
            msg.receiverId === user.id || 
            (msg.receiver && typeof msg.receiver === 'object' && msg.receiver.id === user.id)
          ) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      });
    } catch (err: any) {
      console.error('Erreur lors du marquage de la conversation comme lue:', err);
    }
  }, [user, isAuthenticated]);
  
  /**
   * Définit la conversation active et charge ses messages
   */
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    
    // Charger les messages de cette conversation
    await fetchMessages(conversation.id);
    
    // Marquer comme lu automatiquement
    await markConversationAsRead(conversation.id);
  }, [fetchMessages, markConversationAsRead]);
  
  // Effet pour récupérer les conversations au premier chargement
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchConversations();
    }
  }, [user, isAuthenticated, fetchConversations]);
  
  // Effet pour vérifier s'il y a un nouveau message dans le localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    
    try {
      // Vérifier si un message récent a été enregistré dans le localStorage
      const lastMessageStr = localStorage.getItem('lastSentMessage');
      const lastTimestamp = localStorage.getItem('lastMessageTimestamp');
      
      if (lastMessageStr && lastTimestamp) {
        const timestamp = parseInt(lastTimestamp);
        const isRecent = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes
        
        if (isRecent) {
          const lastMessageData = JSON.parse(lastMessageStr);
          
          // Vérifier si ce message concerne l'utilisateur courant
          if (
            lastMessageData.sender?.id === user.id || 
            lastMessageData.recipient?.id === user.id
          ) {
            // Définir ce message comme dernier message
            setLastMessage({
              id: lastMessageData.id || `temp-${Date.now()}`,
              content: lastMessageData.content,
              sender: lastMessageData.sender,
              senderId: lastMessageData.sender?.id,
              receiver: lastMessageData.recipient,
              receiverId: lastMessageData.recipient?.id,
              createdAt: lastMessageData.createdAt || new Date().toISOString(),
              isRead: true,
              // Métadonnées supplémentaires
              subject: lastMessageData.subject,
              hasAttachment: lastMessageData.hasAttachment,
              serviceId: lastMessageData.serviceId,
              serviceTitle: lastMessageData.serviceTitle
            });
            
            // Déclencher une actualisation des conversations
            fetchConversations();
            
            // Nettoyer le localStorage
            localStorage.removeItem('lastSentMessage');
            localStorage.removeItem('lastMessageTimestamp');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier message:', error);
    }
  }, [user, fetchConversations]);
  
  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    lastMessage,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    markConversationAsRead,
    selectConversation
  };
};

export default useConversations; 