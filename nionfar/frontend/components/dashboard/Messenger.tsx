import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiPaperclip, FiAlertCircle } from 'react-icons/fi';
import { Message as MessageType, User, Attachment } from '../../types';
import messagingService from '../../services/messagingService';
import { toast } from 'react-toastify';

// Interface locale pour la conversation adaptée à l'implémentation actuelle
interface ConversationExtended {
  id: string;
  participants: Array<{id: string, name: string}>;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
  orderId?: string;
  order?: {
    id: string;
    title: string;
  };
}

// Interface locale pour le message adaptée à l'implémentation actuelle
interface MessageExtended extends MessageType {
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface MessengerProps {
  currentUser: User;
  conversation: ConversationExtended;
  onConversationUpdated?: (conversation: ConversationExtended) => void;
}

const Messenger: React.FC<MessengerProps> = ({ 
  currentUser, 
  conversation,
  onConversationUpdated
}) => {
  const [messages, setMessages] = useState<MessageExtended[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les messages au chargement du composant
  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  // Défiler vers le dernier message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (reset = true) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await messagingService.getMessages(
        conversation.id,
        reset ? 1 : page
      );
      
      if (result.success && result.messages) {
        if (reset) {
          setMessages(result.messages as MessageExtended[]);
          setPage(2);
        } else {
          setMessages(prev => [...(result.messages as MessageExtended[] || []), ...prev]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(result.messages.length === 20);
      } else {
        setError(result.error || 'Erreur lors du chargement des messages');
      }
    } catch (error) {
      setError('Une erreur est survenue');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;
    
    setIsSending(true);
    setError(null);
    
    try {
      // Télécharger les pièces jointes d'abord
      let attachmentUrls: string[] = [];
      
      if (attachments.length > 0) {
        attachmentUrls = await uploadAttachments(attachments);
      }
      
      // Envoyer le message
      const result = await messagingService.sendMessage(
        conversation.id,
        newMessage,
        currentUser.id,
        attachmentUrls
      );
      
      if (result.success && result.message) {
        // Ajouter le message à la liste
        setMessages(prev => [...prev, ...(result.message ? [result.message as MessageExtended] : [])]);
        setNewMessage('');
        setAttachments([]);
        
        // Mettre à jour la conversation parente si nécessaire
        if (onConversationUpdated) {
          onConversationUpdated({
            ...conversation,
            lastMessage: result.message.content,
            lastMessageDate: result.message.createdAt
          });
        }
      } else {
        // Afficher l'erreur
        if (result.moderationResult?.violations?.length > 0) {
          // Erreur de modération
          const violationTypes = result.moderationResult.violations.map(
            (v: any) => v.type === 'personal_data' ? 'données personnelles' : 
                        v.type === 'insult' ? 'insultes' : 
                        v.type === 'threat' ? 'menaces' : 'contenu inapproprié'
          );
          
          const uniqueViolationTypes = Array.from(new Set(violationTypes));
          
          toast.error(
            `Votre message contient des éléments interdits (${uniqueViolationTypes.join(', ')}) et ne peut pas être envoyé.`
          );
        } else {
          // Autre erreur
          setError(result.error || 'Erreur lors de l\'envoi du message');
          toast.error(result.error || 'Erreur lors de l\'envoi du message');
        }
      }
    } catch (error) {
      setError('Une erreur est survenue lors de l\'envoi du message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const uploadAttachments = async (files: File[]): Promise<string[]> => {
    // Ici, vous implémenteriez la logique de téléchargement de fichiers
    // Pour cet exemple, nous simulons simplement un téléchargement réussi
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(files.map((_, index) => `https://example.com/upload/${index}`));
      }, 1000);
    });
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Formate la date d'un message
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Trouve le destinataire (pas l'utilisateur courant) dans une conversation
  const getRecipient = () => {
    return conversation.participants.find(p => p.id !== currentUser.id) || 
      { id: '', name: 'Destinataire inconnu' };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* En-tête de la conversation */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {getRecipient().name}
          </h3>
          {conversation.order && (
            <p className="text-sm text-gray-500">
              Commande: {conversation.order.title}
            </p>
          )}
        </div>
      </div>
      
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && page === 1 ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Chargement...' : 'Charger plus de messages'}
                </button>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 break-words ${
                    message.sender.id === currentUser.id
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center text-xs text-blue-600 hover:underline"
                        >
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            {attachment.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formatMessageDate(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Alerte d'erreur */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-800 flex items-center text-sm">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Liste des pièces jointes à envoyer */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Pièces jointes:</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 rounded px-2 py-1 text-xs"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Formulaire d'envoi de message */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              disabled={isSending}
            ></textarea>
            <div className="mt-1 text-xs text-gray-500">
              Aucune donnée personnelle ne peut être échangée (email, téléphone, etc.)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2 text-gray-500 hover:text-indigo-500"
              disabled={isSending}
            >
              <FiPaperclip size={20} />
            </button>
            <button
              type="submit"
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
              disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
            >
              {isSending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <FiSend size={20} />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Messenger; 