import { NextPage } from 'next';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import FileUploader from '../../../components/dashboard/FileUploader';
import { 
  FiArrowLeft, 
  FiSend, 
  FiPaperclip,
  FiMoreVertical, 
  FiTrash2, 
  FiArchive, 
  FiStar,
  FiFlag,
  FiDownload,
  FiCheck,
  FiClock,
  FiCalendar,
  FiShoppingBag,
  FiUser,
  FiFileText,
  FiX,
  FiImage,
  FiPlus,
  FiExternalLink,
  FiDollarSign,
  FiMaximize
} from 'react-icons/fi/index.js';
import { Conversation, Message, Attachment } from '../../../types';
import { conversations, messages, getMessagesByConversationId } from '../../../data/mockMessages';

const ConversationPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;

    // Charger la conversation
    const conversationId = typeof id === 'string' ? id : id[0];
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      setConversation(conversation);
      
      // Charger les messages de cette conversation
      const conversationMessages = getMessagesByConversationId(conversationId);
      setMessages(conversationMessages);
    } else {
      // Gérer le cas où la conversation n'est pas trouvée
      router.push('/dashboard/messages');
    }
    
    setIsLoading(false);
  }, [id, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Formater la date des messages
  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Grouper les messages par date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  };

  // Envoyer un nouveau message
  const handleSendMessage = () => {
    if ((!newMessage.trim() && attachments.length === 0) || isSending) return;
    
    if (!conversation) return;
    
    const client = conversation.participants.find(p => 
      typeof p === 'object' && p !== null && (p as Record<string, any>)['id'] !== 'USR-001'
    );
    if (!client) return;
    
    // Indiquer que l'envoi est en cours
    setIsSending(true);
    
    // Simuler le traitement des pièces jointes
    const processAttachments = async () => {
      if (attachments.length === 0) return [];
      
      // Dans une application réelle, on enverrait les fichiers à un serveur
      // et on récupérerait des URLs ou des identifiants
      return attachments.map((file, index) => ({
        id: `ATT-NEW-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file), // Simuler une URL de fichier
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
        thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        extension: file.name.split('.').pop() || '',
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }));
    };
    
    // Traiter les pièces jointes et créer un nouveau message
    (async () => {
      try {
        // Simuler un délai pour l'upload
        await new Promise(resolve => setTimeout(resolve, 800));
        const processedAttachments = await processAttachments();
        
        // Créer un nouveau message
        const newMessageObj: Message = {
          id: `MSG-${Date.now()}`,
          content: newMessage,
          sender: conversation.participants[0], // Current user (Amadou)
          receiver: client,
          conversation: conversation.id,
          createdAt: new Date().toISOString(),
          isRead: true,
          attachments: processedAttachments.length > 0 ? processedAttachments as Attachment[] : undefined
        };
        
        // Mise à jour locale des messages
        setMessages(prev => [...prev, newMessageObj]);
        setNewMessage('');
        setAttachments([]);
        setShowFileUploader(false);
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        // Dans une application réelle, on afficherait une notification d'erreur
      } finally {
        setIsSending(false);
      }
    })();
  };

  // Gérer l'appui sur Entrée pour envoyer
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gérer l'affichage de l'uploader
  const toggleFileUploader = () => {
    console.log("Toggle uploader, current state:", showFileUploader);
    setShowFileUploader(!showFileUploader);
  };

  // Gérer les fichiers sélectionnés
  const handleFilesSelected = (files: File[]) => {
    setAttachments(prevAttachments => [...prevAttachments, ...files]);
  };

  // Supprimer un fichier
  const handleRemoveFile = (index: number) => {
    setAttachments(prevAttachments => 
      prevAttachments.filter((_, i) => i !== index)
    );
  };

  // Fonction pour formater la taille de fichier
  const formatFileSize = (sizeInBytes?: number | string): string => {
    if (sizeInBytes === undefined) return 'Taille inconnue';
    
    // Convertir la chaîne en nombre si nécessaire
    const size = typeof sizeInBytes === 'string' ? parseInt(sizeInBytes, 10) : sizeInBytes;
    
    // Si la conversion a échoué ou size est invalide
    if (isNaN(size) || size === 0) return 'Taille inconnue';
    
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Obtenir l'icône appropriée pour le type de fichier
  const getAttachmentIcon = (type: string) => {
    if (type.startsWith('image/')) return <FiImage className="h-5 w-5 text-indigo-500" />;
    return <FiFileText className="h-5 w-5 text-gray-500" />;
  };

  // Vérifier si c'est le premier message d'un expéditeur
  const isFirstMessageFromSender = (message: Message, index: number): boolean => {
    if (index === 0) return true;
    return messages[index - 1].sender.id !== message.sender.id;
  };

  // Vérifier si c'est le dernier message d'un expéditeur
  const isLastMessageFromSender = (message: Message, index: number): boolean => {
    if (index === messages.length - 1) return true;
    return messages[index + 1].sender.id !== message.sender.id;
  };

  // Composant pour afficher les pièces jointes d'un message
  const MessageAttachments = ({ attachments }: { attachments: Attachment[] }) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    const openImagePreview = (imageUrl: string) => {
      setPreviewImage(imageUrl);
      setPreviewModalOpen(true);
    };

    // Grouper les pièces jointes par type
    const imageAttachments = attachments.filter(att => att.type === 'image');
    const documentAttachments = attachments.filter(att => att.type !== 'image');

    if (attachments.length === 0) return null;

    return (
      <div className="mt-2">
        {/* Affichage des images */}
        {imageAttachments.length > 0 && (
          <div className="mt-2">
            <div className="grid grid-cols-2 gap-2">
              {imageAttachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="relative rounded-lg overflow-hidden border border-gray-200 group cursor-pointer"
                >
                  <img 
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-auto object-cover max-h-36"
                    onClick={() => openImagePreview(attachment.url)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openImagePreview(attachment.url)}
                      className="p-1 bg-white rounded-full shadow-md"
                    >
                      <FiMaximize className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Affichage des documents */}
        {documentAttachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {documentAttachments.map((attachment) => (
              <div 
                key={attachment.id}
                className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-indigo-100 rounded-lg">
                  <FiFileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
                <a 
                  href={attachment.url}
                  download={attachment.name}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                >
                  <FiDownload className="h-5 w-5" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Modal de prévisualisation d'image */}
        {previewModalOpen && previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="max-w-4xl max-h-[90vh] relative">
              <img 
                src={previewImage} 
                alt="Aperçu" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Vérifier si on a des pièces jointes en cours
  const hasAttachments = attachments.length > 0;

  // Animation de chargement
  if (isLoading) {
    return (
      <DashboardLayout title="Conversation | NionFar.sn">
        <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-6 mt-4 sm:mt-6 lg:mt-8"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] p-6">
              <div className="h-16 bg-gray-200 rounded-lg w-full mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`h-24 bg-gray-200 rounded-xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`}></div>
                  </div>
                ))}
              </div>
              <div className="h-16 bg-gray-200 rounded-lg w-full mt-6"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!conversation) {
    return (
      <DashboardLayout title="Conversation | NionFar.sn">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiClock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation non trouvée</h3>
            <p className="text-gray-500 text-center mb-6">Cette conversation n'existe pas ou a été supprimée.</p>
            <Link 
              href="/dashboard/messages" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
            >
              Retour aux messages
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Récupérer l'utilisateur client (non USR-001)
  const client = conversation.participants.find(p => 
    typeof p === 'object' && p !== null && (p as Record<string, any>)['id'] !== 'USR-001'
  );
  
  if (!client) {
    return (
      <DashboardLayout title="Conversation | NionFar.sn">
        <div className="p-4 sm:p-6 lg:p-8">Utilisateur non trouvé</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Conversation avec ${client.username} | NionFar.sn`}>
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
        {/* En-tête avec lien de retour */}
        <div className="flex items-center justify-between mb-4 mt-4 sm:mt-6 lg:mt-8">
          <Link href="/dashboard/messages" className="flex items-center text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Retour aux messages</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
              onClick={() => setShowOrderDetails(!showOrderDetails)}
            >
              <FiShoppingBag className="h-5 w-5" />
            </button>
            <div className="relative">
              <button 
                className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
                onClick={() => {}}
              >
                <FiMoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Interface de chat */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-180px)]">
          {/* En-tête de conversation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 relative">
                {client.avatar ? (
                  <img 
                    src={client.avatar} 
                    alt={client.username} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {client.username.charAt(0)}
                  </div>
                )}
                {client.isVerified && (
                  <div className="absolute -right-0.5 -bottom-0.5 bg-green-500 p-0.5 rounded-full border-2 border-white">
                    <FiCheck className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
              
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">{client.username}</h2>
                {conversation.order && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{conversation.order.title}</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full
                      ${conversation.order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                      ${conversation.order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${conversation.order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                      ${conversation.order.status === 'revision' ? 'bg-purple-100 text-purple-700' : ''}
                      ${conversation.order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {conversation.order.status === 'in_progress' && 'En cours'}
                      {conversation.order.status === 'pending' && 'En attente'}
                      {conversation.order.status === 'completed' && 'Terminé'}
                      {conversation.order.status === 'revision' && 'Révision'}
                      {conversation.order.status === 'cancelled' && 'Annulé'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Zone des messages avec panneau d'informations */}
          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6" style={{ backgroundColor: '#f9fafc' }}>
              {groupMessagesByDate().map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                      {group.date}
                    </div>
                  </div>
                  
                  {group.messages.map((message, messageIndex) => {
                    const isOwnMessage = message.sender.id === 'USR-001';
                    const isFirst = isFirstMessageFromSender(message, messages.indexOf(message));
                    const isLast = isLastMessageFromSender(message, messages.indexOf(message));
                    
                    return (
                      <div key={message.id} className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          {isFirst && !isOwnMessage && (
                            <div className="flex items-center mb-1">
                              {message.sender.avatar ? (
                                <img 
                                  src={message.sender.avatar} 
                                  alt={message.sender.username} 
                                  className="w-6 h-6 rounded-full mr-2 object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 text-xs font-medium">
                                  {message.sender.username.charAt(0)}
                                </div>
                              )}
                              <span className="text-sm font-medium">{message.sender.username}</span>
                            </div>
                          )}
                          
                          <div 
                            className={`px-4 py-3 rounded-lg ${
                              isOwnMessage
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                            } ${isFirst && isOwnMessage ? 'rounded-tr-none' : ''} ${isFirst && !isOwnMessage ? 'rounded-tl-none' : ''}`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <MessageAttachments attachments={message.attachments} />
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-1">
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.createdAt)}
                              {isOwnMessage && (
                                <span className="ml-1 text-indigo-600">
                                  <FiCheck className="h-3 w-3 inline" />
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Panneau d'informations sur la commande */}
            {showOrderDetails && conversation.order && (
              <div className="w-80 border-l border-gray-200 overflow-y-auto bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Détails de la commande</h3>
                  <button 
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="rounded-lg border border-gray-200 overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">#{conversation.order.id}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{conversation.order.title}</h4>
                    
                    <div className="flex items-center mb-3">
                      <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{client.username}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <FiShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{conversation.order.service.title}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Livraison: {conversation.order.deadline}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <FiDollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{conversation.order.price.toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="mt-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${conversation.order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                        ${conversation.order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${conversation.order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                        ${conversation.order.status === 'revision' ? 'bg-purple-100 text-purple-700' : ''}
                        ${conversation.order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {conversation.order.status === 'in_progress' && 'En cours'}
                        {conversation.order.status === 'pending' && 'En attente'}
                        {conversation.order.status === 'completed' && 'Terminé'}
                        {conversation.order.status === 'revision' && 'Révision'}
                        {conversation.order.status === 'cancelled' && 'Annulé'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/orders/${conversation.order.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                >
                  <FiExternalLink className="mr-2 h-4 w-4" />
                  Voir la commande
                </Link>
              </div>
            )}
          </div>
          
          {/* Zone de saisie de message */}
          <div className="border-t border-gray-200 p-4">
            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 pr-1"
                  >
                    {file.type.startsWith('image/') ? (
                      <FiImage className="h-4 w-4 text-indigo-500 mr-2" />
                    ) : (
                      <FiFileText className="h-4 w-4 text-gray-600 mr-2" />
                    )}
                    <span className="text-xs text-gray-700 truncate max-w-[120px]">
                      {file.name}
                    </span>
                    <button 
                      className="ml-1 p-1 hover:bg-gray-200 rounded-full"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <FiX className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* File Uploader */}
            {showFileUploader && (
              <div className="mb-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Joindre des fichiers</h4>
                  <button 
                    onClick={() => setShowFileUploader(false)}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                
                <FileUploader
                  onFilesSelected={handleFilesSelected}
                  currentFiles={attachments}
                  onRemoveFile={handleRemoveFile}
                  maxFiles={5}
                  maxSizeMB={10}
                  allowedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']}
                  isDisabled={isSending}
                />
              </div>
            )}
            
            <div className="flex items-end border border-gray-300 rounded-lg bg-white">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 p-3 focus:outline-none resize-none max-h-32 min-h-[40px]"
                rows={1}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <div className="flex items-center p-2">
                <button 
                  type="button" 
                  id="attachment-button"
                  className={`p-2.5 rounded-full ${
                    showFileUploader 
                      ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-300' 
                      : 'bg-gray-100 text-gray-500 hover:text-indigo-600 hover:bg-gray-200'
                  }`}
                  onClick={toggleFileUploader}
                  aria-label="Joindre des fichiers"
                  disabled={isSending}
                >
                  <FiPaperclip className="h-5 w-5" />
                </button>
                <button 
                  type="button" 
                  className={`ml-1 p-2.5 rounded-full ${
                    isSending 
                      ? 'text-indigo-400 animate-pulse' 
                      : newMessage.trim() || hasAttachments
                        ? 'text-indigo-600 hover:bg-indigo-50'
                        : 'text-gray-400'
                  }`}
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !hasAttachments) || isSending}
                  aria-label="Envoyer le message"
                >
                  <FiSend className={`h-5 w-5 ${isSending ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationPage; 