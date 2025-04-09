import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FiSearch, 
  FiMessageCircle, 
  FiSend,
  FiChevronRight,
  FiUser,
  FiClock
} from 'react-icons/fi/index.js';
import Image from 'next/image';
import Link from 'next/link';
import ClientDashboardLayout from '../../../../components/dashboard/ClientDashboardLayout';

// Types
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'client' | 'seller';
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  orderId: string;
  orderTitle: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
}

const MessagesPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Formater le temps relatif pour les messages
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Simuler le chargement des données au chargement de la page
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données fictives pour les conversations
      const mockConversations: Conversation[] = [
        {
          id: 'conv-001',
          orderId: 'CMD-2023-05-18-001',
          orderTitle: 'Conception de logo professionnel',
          sellerId: 'seller-001',
          sellerName: 'Amadou Diop',
          sellerAvatar: '/images/avatars/amadou.jpg',
          lastMessage: {
            id: 'msg-101',
            content: 'Bonjour, je viens de commencer à travailler sur votre logo. Avez-vous des préférences de couleur spécifiques ?',
            senderId: 'seller-001',
            senderType: 'seller',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures avant
            read: false
          },
          unreadCount: 1
        },
        {
          id: 'conv-002',
          orderId: 'CMD-2023-05-10-003',
          orderTitle: 'Développement d\'une application mobile',
          sellerId: 'seller-002',
          sellerName: 'Fatou Ndiaye',
          sellerAvatar: '/images/avatars/fatou.jpg',
          lastMessage: {
            id: 'msg-203',
            content: 'Merci pour vos commentaires. J\'ai apporté les modifications demandées. Vous pouvez consulter la nouvelle version dans les livraisons.',
            senderId: 'seller-002',
            senderType: 'seller',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
            read: true
          },
          unreadCount: 0
        },
        {
          id: 'conv-003',
          orderId: 'CMD-2023-04-25-007',
          orderTitle: 'Rédaction d\'articles de blog',
          sellerId: 'seller-003',
          sellerName: 'Ibrahim Sow',
          sellerAvatar: '/images/avatars/ibrahim.jpg',
          lastMessage: {
            id: 'msg-305',
            content: 'Je vous remercie pour votre confiance. N\'hésitez pas à me contacter si vous avez besoin d\'autres articles !',
            senderId: 'client-001',
            senderType: 'client',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours avant
            read: true
          },
          unreadCount: 0
        }
      ];
      
      setConversations(mockConversations);
      
      // Si une conversation est sélectionnée dans l'URL
      const { conversationId } = router.query;
      if (conversationId) {
        const selectedConv = mockConversations.find(conv => conv.id === conversationId);
        if (selectedConv) {
          setSelectedConversation(selectedConv);
          loadMessages(selectedConv.id);
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [router.query]);

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: string) => {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données fictives pour les messages
    const mockMessages: Record<string, Message[]> = {
      'conv-001': [
        {
          id: 'msg-100',
          content: 'Bonjour, je suis ravi de travailler sur votre commande de logo. Avez-vous un brief ou des exemples de styles que vous aimez ?',
          senderId: 'seller-001',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 heures avant
          read: true
        },
        {
          id: 'msg-101',
          content: 'Bonjour, je viens de commencer à travailler sur votre logo. Avez-vous des préférences de couleur spécifiques ?',
          senderId: 'seller-001',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures avant
          read: false
        }
      ],
      'conv-002': [
        {
          id: 'msg-200',
          content: 'Bonjour, j\'ai reçu votre commande pour le développement de l\'application mobile. Pouvez-vous me préciser les fonctionnalités principales que vous souhaitez ?',
          senderId: 'seller-002',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours avant
          read: true
        },
        {
          id: 'msg-201',
          content: 'Bonjour Fatou, je voudrais une application de suivi de budget avec des graphiques et des notifications. L\'interface doit être simple et intuitive.',
          senderId: 'client-001',
          senderType: 'client',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 jours avant
          read: true
        },
        {
          id: 'msg-202',
          content: 'Merci pour ces précisions. J\'ai préparé une première maquette. Vous pouvez la consulter dans les livraisons. Dites-moi ce que vous en pensez.',
          senderId: 'seller-002',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours avant
          read: true
        },
        {
          id: 'msg-203',
          content: 'Merci pour vos commentaires. J\'ai apporté les modifications demandées. Vous pouvez consulter la nouvelle version dans les livraisons.',
          senderId: 'seller-002',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
          read: true
        }
      ],
      'conv-003': [
        {
          id: 'msg-300',
          content: 'Bonjour, j\'ai commencé à travailler sur vos articles de blog. Avez-vous des mots-clés spécifiques à cibler ?',
          senderId: 'seller-003',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 jours avant
          read: true
        },
        {
          id: 'msg-301',
          content: 'Oui, j\'aimerais cibler les mots-clés "marketing digital", "stratégie de contenu" et "SEO au Sénégal".',
          senderId: 'client-001',
          senderType: 'client',
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 jours avant
          read: true
        },
        {
          id: 'msg-302',
          content: 'Parfait, je vais intégrer ces mots-clés. Je prévois de livrer le premier article d\'ici deux jours.',
          senderId: 'seller-003',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 jours avant
          read: true
        },
        {
          id: 'msg-303',
          content: 'J\'ai terminé tous les articles. Vous pouvez les consulter dans la section des livraisons. J\'espère qu\'ils vous plairont !',
          senderId: 'seller-003',
          senderType: 'seller',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 jours avant
          read: true
        },
        {
          id: 'msg-304',
          content: 'Les articles sont parfaits, merci beaucoup pour votre travail de qualité !',
          senderId: 'client-001',
          senderType: 'client',
          timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000), // 3.5 jours avant
          read: true
        },
        {
          id: 'msg-305',
          content: 'Je vous remercie pour votre confiance. N\'hésitez pas à me contacter si vous avez besoin d\'autres articles !',
          senderId: 'client-001',
          senderType: 'client',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours avant
          read: true
        }
      ]
    };
    
    setMessages(mockMessages[conversationId] || []);
    
    // Marquer les messages comme lus
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, read: true } } 
          : conv
      )
    );
  };

  // Sélectionner une conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    
    // Mettre à jour l'URL sans rechargement de page
    router.push(`/dashboard/client/messages?conversationId=${conversation.id}`, undefined, { shallow: true });
  };

  // Envoyer un nouveau message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Créer un nouveau message
    const message: Message = {
      id: `msg-new-${Date.now()}`,
      content: newMessage,
      senderId: 'client-001',
      senderType: 'client',
      timestamp: new Date(),
      read: true
    };
    
    // Ajouter le message à la conversation
    setMessages(prevMessages => [...prevMessages, message]);
    
    // Mettre à jour la dernière conversation
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: message } 
          : conv
      )
    );
    
    // Réinitialiser le champ de saisie
    setNewMessage('');
  };

  // Filtrer les conversations par la recherche
  const filteredConversations = conversations.filter(conv => 
    conv.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ClientDashboardLayout title="Messages | NionFar.sn">
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 h-[calc(100vh-64px)]">
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row overflow-hidden">
          {/* Liste des conversations */}
          <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 overflow-hidden flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600">Chargement...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Aucune conversation trouvée</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredConversations.map(conversation => (
                    <li key={conversation.id}>
                      <button
                        className={`w-full text-left p-4 hover:bg-gray-50 focus:outline-none transition-colors ${selectedConversation?.id === conversation.id ? 'bg-indigo-50' : ''}`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            {conversation.sellerAvatar ? (
                              <Image
                                src={conversation.sellerAvatar}
                                alt={conversation.sellerName}
                                width={40}
                                height={40}
                                className="rounded-full"
                                unoptimized
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <FiUser className="h-5 w-5 text-indigo-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <h2 className={`text-sm font-medium truncate ${conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                {conversation.sellerName}
                              </h2>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatRelativeTime(conversation.lastMessage.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-1">{conversation.orderTitle}</p>
                            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {conversation.lastMessage.senderType === 'client' ? 'Vous: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="ml-2 flex-shrink-0">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-xs font-medium text-white">
                                {conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Conversation sélectionnée */}
          <div className={`w-full md:w-2/3 lg:w-3/4 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <FiMessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-medium text-gray-700 mb-2">Aucune conversation sélectionnée</h2>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Sélectionnez une conversation dans la liste pour afficher les messages.
                </p>
              </div>
            ) : (
              <>
                {/* En-tête de la conversation */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button
                    className="md:hidden mr-3 text-gray-500"
                    onClick={() => {
                      setSelectedConversation(null);
                      router.push('/dashboard/client/messages', undefined, { shallow: true });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="flex-shrink-0 mr-3">
                    {selectedConversation.sellerAvatar ? (
                      <Image
                        src={selectedConversation.sellerAvatar}
                        alt={selectedConversation.sellerName}
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-gray-900">{selectedConversation.sellerName}</h2>
                    <div className="flex items-center">
                      <Link 
                        href={`/dashboard/client/orders/${selectedConversation.orderId}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        {selectedConversation.orderTitle}
                        <FiChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Corps de la conversation */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div key={message.id} className={`flex ${message.senderType === 'client' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          message.senderType === 'client' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`text-xs mt-1 flex items-center ${
                            message.senderType === 'client' ? 'text-indigo-200' : 'text-gray-500'
                          }`}>
                            <FiClock className="h-3 w-3 mr-1" />
                            {formatRelativeTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Formulaire d'envoi de message */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSend className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default MessagesPage; 