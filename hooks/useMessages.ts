import { useState, useEffect, useCallback } from 'react';
import { Message, User } from '../types';
import { messageService } from '../services/messageService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personnalisé pour gérer les messages d'une conversation spécifique
 * @param conversationId ID de la conversation
 */
export const useMessages = (conversationId: string) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState({
    messages: false,
    sending: false
  });
  const [error, setError] = useState<string | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState<Message | null>(null);
  
  /**
   * Récupère les messages de la conversation
   */
  const fetchMessages = useCallback(async () => {
    if (!user || !isAuthenticated || !conversationId) return;
    
    setLoading(prev => ({ ...prev, messages: true }));
    setError(null);
    
    try {
      const result = await messageService.getConversationMessages(conversationId);
      
      if (result.success && result.messages) {
        setMessages(result.messages);
        
        // Vérifier s'il y a des messages non lus
        const unreadCount = result.messages.filter(msg => 
          !msg.isRead && 
          (
            msg.receiverId === user.id || 
            (msg.receiver && typeof msg.receiver === 'object' && msg.receiver.id === user.id)
          )
        ).length;
        
        setHasUnreadMessages(unreadCount > 0);
      } else {
        setError(result.error || 'Erreur lors de la récupération des messages');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, [user, isAuthenticated, conversationId]);
  
  /**
   * Envoie un nouveau message dans la conversation
   */
  const sendMessage = useCallback(async (
    content: string,
    files?: File[]
  ) => {
    if (!user || !isAuthenticated || !conversationId) return null;
    
    setLoading(prev => ({ ...prev, sending: true }));
    setError(null);
    
    try {
      // Créer un message temporaire pour l'UI
      const tempMessage = messageService.createTemporaryMessage(
        content,
        user.id,
        conversationId,
        files
      );
      
      // Ajouter immédiatement le message temporaire à l'UI
      setMessages(prev => [...prev, tempMessage]);
      
      // Envoyer le message au serveur
      const result = await messageService.sendMessage(
        conversationId,
        content,
        user.id,
        files
      );
      
      if (result.success && result.message) {
        // Remplacer le message temporaire par le message réel
        setMessages(prev => 
          messageService.replaceTemporaryMessage(prev, tempMessage.id, result.message!)
        );
        
        // Enregistrer le dernier message envoyé
        setLastSentMessage(result.message);
        
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
  }, [user, isAuthenticated, conversationId]);
  
  /**
   * Marque tous les messages de la conversation comme lus
   */
  const markAsRead = useCallback(async () => {
    if (!user || !isAuthenticated || !conversationId) return;
    
    try {
      await messageService.markConversationAsRead(conversationId, user.id);
      
      // Mettre à jour l'état des messages dans l'UI
      setMessages(prev => {
        return prev.map(msg => {
          // Ne marquer comme lus que les messages envoyés à l'utilisateur courant
          if (
            !msg.isRead && 
            (
              msg.receiverId === user.id || 
              (msg.receiver && typeof msg.receiver === 'object' && msg.receiver.id === user.id)
            )
          ) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      });
      
      setHasUnreadMessages(false);
    } catch (err: any) {
      console.error('Erreur lors du marquage des messages comme lus:', err);
    }
  }, [user, isAuthenticated, conversationId]);
  
  /**
   * Vérifie si un message est de l'utilisateur courant
   */
  const isOwnMessage = useCallback((message: Message) => {
    if (!user) return false;
    
    return (
      message.senderId === user.id || 
      (message.sender && typeof message.sender === 'object' && message.sender.id === user.id)
    );
  }, [user]);
  
  // Charger les messages au premier rendu et quand la conversation change
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);
  
  // Si la conversation a des messages non lus et l'utilisateur est actif sur cette page, 
  // les marquer automatiquement comme lus
  useEffect(() => {
    if (hasUnreadMessages && user && isAuthenticated && conversationId) {
      markAsRead();
    }
  }, [hasUnreadMessages, user, isAuthenticated, conversationId, markAsRead]);
  
  // Exposer les fonctionnalités et états du hook
  return {
    messages,
    loading,
    error,
    lastSentMessage,
    sendMessage,
    fetchMessages,
    markAsRead,
    isOwnMessage
  };
};

export default useMessages; 