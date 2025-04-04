import { NextPage } from 'next';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { 
  FiSearch, 
  FiFilter, 
  FiStar, 
  FiClock, 
  FiPaperclip, 
  FiChevronRight, 
  FiShoppingBag, 
  FiX, 
  FiPlus,
  FiCheck,
  FiMoreVertical,
  FiTrash2,
  FiArchive,
  FiMessageSquare,
  FiRefreshCw,
  FiAlertCircle,
  FiInbox,
  FiMail,
  FiChevronDown,
  FiBox,
  FiUser,
  FiArrowLeft
} from 'react-icons/fi';
import { Conversation, Message } from '../../../types';
import { mockConversations } from '../../../data/mockMessages';

const MessagesPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [contextMenuOpen, setContextMenuOpen] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMessageFilter, setSelectedMessageFilter] = useState<'all' | 'unread' | 'attachments'>('all');
  
  const contextMenuRef = useRef<HTMLDivElement>(null);
  
  // Stats des conversations
  const conversationStats = useMemo(() => {
    return {
      total: conversations.length,
      unread: conversations.filter(c => c.unreadCount > 0).length,
      active: conversations.filter(c => c.isActive).length,
      archived: conversations.filter(c => !c.isActive).length
    };
  }, [conversations]);

  useEffect(() => {
    // Simuler le chargement des données
    const fetchData = async () => {
      try {
        // Simulation d'une requête API
        await new Promise(resolve => setTimeout(resolve, 800));
        setConversations(mockConversations);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des conversations:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Effet pour fermer le menu contextuel quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenuOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrage des conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      // Filtre par statut
      if (selectedFilter === 'unread' && conversation.unreadCount === 0) return false;
      if (selectedFilter === 'active' && !conversation.isActive) return false;
      if (selectedFilter === 'archived' && conversation.isActive) return false;
      
      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const clientName = conversation.participants.find(p => p.id !== 'USR-001')?.username.toLowerCase() || '';
        const orderTitle = conversation.order?.title.toLowerCase() || '';
        
        if (!clientName.includes(query) && !orderTitle.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [conversations, selectedFilter, searchQuery]);

  // Format de date pour les messages
  const formatMessageDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Aujourd'hui - afficher l'heure
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Hier
      return 'Hier';
    } else if (diffDays < 7) {
      // Cette semaine - afficher le jour
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      // Plus ancien - afficher la date complète
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Fonction pour marquer comme lu
  const markAsRead = (conversationId: string) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  // Fonction pour archiver une conversation
  const archiveConversation = (conversationId: string) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId ? { ...conv, isActive: false } : conv
      )
    );
    setContextMenuOpen(null);
  };

  // Fonction pour obtenir le badge de statut d'une commande
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
            En cours
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
            En attente
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
            Terminé
          </span>
        );
      case 'revision':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
            Révision
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
            Annulé
          </span>
        );
      default:
        return null;
    }
  };

  // Animation de chargement
  if (isLoading) {
    return (
      <DashboardLayout title="Messages | NionFar.sn">
        <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6 mt-4 sm:mt-6 lg:mt-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="flex gap-6">
              <div className="w-1/3 bg-gray-200 h-16 rounded-xl mb-4"></div>
              <div className="w-2/3 bg-gray-200 h-16 rounded-xl mb-4"></div>
            </div>
            <div className="flex gap-6 h-[600px]">
              <div className="w-1/3 bg-gray-200 rounded-xl"></div>
              <div className="w-2/3 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Messages | NionFar.sn">
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
        {/* En-tête avec compteurs et bouton de rafraîchissement */}
        <div className="flex items-center justify-between mb-6 mt-4 sm:mt-6 lg:mt-8">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 hidden sm:flex items-center">
              <FiInbox className="text-gray-400 mr-2" />
              <span className="text-gray-900 font-medium">{conversationStats.total}</span>
              <span className="text-gray-500 ml-1">conversation{conversationStats.total !== 1 ? 's' : ''}</span>
            </div>
            <button 
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-70"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
        
        {/* Onglets de statut (version mobile) */}
        <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-2 flex overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setSelectedFilter('all')}
            className={`flex-1 min-w-max flex flex-col items-center px-3 py-2 rounded-lg ${
              selectedFilter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
            }`}
          >
            <FiInbox className="mb-1 h-5 w-5" />
            <span className="text-xs">Toutes ({conversationStats.total})</span>
          </button>
          <button 
            onClick={() => setSelectedFilter('unread')}
            className={`flex-1 min-w-max flex flex-col items-center px-3 py-2 rounded-lg ${
              selectedFilter === 'unread' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
            }`}
          >
            <FiMail className="mb-1 h-5 w-5" />
            <span className="text-xs">Non lues ({conversationStats.unread})</span>
          </button>
          <button 
            onClick={() => setSelectedFilter('active')}
            className={`flex-1 min-w-max flex flex-col items-center px-3 py-2 rounded-lg ${
              selectedFilter === 'active' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
            }`}
          >
            <FiMail className="mb-1 h-5 w-5" />
            <span className="text-xs">Actives ({conversationStats.active})</span>
          </button>
          <button 
            onClick={() => setSelectedFilter('archived')}
            className={`flex-1 min-w-max flex flex-col items-center px-3 py-2 rounded-lg ${
              selectedFilter === 'archived' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
            }`}
          >
            <FiArchive className="mb-1 h-5 w-5" />
            <span className="text-xs">Archivées ({conversationStats.archived})</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Liste des conversations - Version mobile */}
          <div className={`md:w-1/3 lg:w-1/4 flex flex-col ${mobileView === 'detail' ? 'hidden md:flex' : ''}`}>
            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Filtres de statut (version desktop) */}
              <div className="hidden md:flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap flex items-center ${
                    selectedFilter === 'all' 
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiInbox className="mr-1.5 h-4 w-4" />
                  Toutes <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">{conversationStats.total}</span>
                </button>
                <button 
                  onClick={() => setSelectedFilter('unread')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap flex items-center ${
                    selectedFilter === 'unread' 
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiMail className="mr-1.5 h-4 w-4" />
                  Non lues <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">{conversationStats.unread}</span>
                </button>
                <button 
                  onClick={() => setSelectedFilter('active')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap flex items-center ${
                    selectedFilter === 'active' 
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiMail className="mr-1.5 h-4 w-4" />
                  Actives <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">{conversationStats.active}</span>
                </button>
                <button 
                  onClick={() => setSelectedFilter('archived')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap flex items-center ${
                    selectedFilter === 'archived' 
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiArchive className="mr-1.5 h-4 w-4" />
                  Archivées <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">{conversationStats.archived}</span>
                </button>
              </div>
              
              {/* Bouton nouvelle conversation */}
              <div className="mt-4 md:mt-3">
                <Link 
                  href="/dashboard/messages/new" 
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FiPlus className="h-4 w-4" />
                  <span>Nouvelle conversation</span>
                </Link>
              </div>
            </div>
            
            {/* Liste des conversations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-grow">
              {filteredConversations.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-280px)] overflow-y-auto">
                  {filteredConversations.map((conversation) => {
                    // Récupérer l'utilisateur client (non USR-001)
                    const client = conversation.participants.find(user => user.id !== 'USR-001');
                    
                    if (!client) return null;
                    
                    return (
                      <div key={conversation.id} className="relative">
                        <Link
                          href={`/dashboard/messages/${conversation.id}`}
                          className={`block p-4 hover:bg-gray-50 relative ${conversation.unreadCount > 0 ? 'bg-indigo-50/40' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedConversation(conversation);
                            setMobileView('detail');
                          }}
                        >
                          <div className="flex items-start gap-3">
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
                              {client.isOnline && (
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{client.username}</h3>
                                <span className="text-xs text-gray-500">
                                  {formatMessageDate(conversation.updatedAt)}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {conversation.order?.title || 'Conversation générale'}
                              </p>
                              
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {conversation.lastMessage?.content}
                              </p>
                              
                              <div className="flex items-center mt-2 gap-2">
                                {conversation.order && getOrderStatusBadge(conversation.order.status)}
                                
                                {conversation.lastMessage?.attachments && conversation.lastMessage.attachments.length > 0 && (
                                  <span className="flex items-center text-xs text-gray-500">
                                    <FiPaperclip className="h-3 w-3 mr-1" />
                                    <span>Pièce jointe</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {conversation.unreadCount > 0 && (
                              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </Link>
                        
                        {/* Bouton menu contextuel */}
                        <button
                          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuOpen(contextMenuOpen === conversation.id ? null : conversation.id);
                          }}
                        >
                          <FiMoreVertical className="h-4 w-4" />
                        </button>
                        
                        {/* Menu contextuel */}
                        {contextMenuOpen === conversation.id && (
                          <div 
                            ref={contextMenuRef}
                            className="absolute top-10 right-3 bg-white shadow-lg rounded-lg py-1 border border-gray-200 z-10 w-48"
                          >
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => markAsRead(conversation.id)}
                            >
                              <FiCheck className="h-4 w-4 mr-3 text-gray-500" />
                              Marquer comme lu
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => archiveConversation(conversation.id)}
                            >
                              <FiArchive className="h-4 w-4 mr-3 text-gray-500" />
                              Archiver
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => setContextMenuOpen(null)}
                            >
                              <FiTrash2 className="h-4 w-4 mr-3 text-red-500" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {selectedFilter === 'unread' ? (
                      <FiMail className="h-8 w-8 text-gray-400" />
                    ) : selectedFilter === 'archived' ? (
                      <FiArchive className="h-8 w-8 text-gray-400" />
                    ) : (
                      <FiMessageSquare className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation trouvée</h3>
                  <p className="text-gray-500 mt-2 max-w-sm">
                    {searchQuery 
                      ? "Aucune conversation ne correspond à votre recherche."
                      : selectedFilter === 'unread' 
                        ? "Vous n'avez pas de messages non lus."
                        : selectedFilter === 'archived' 
                          ? "Vous n'avez pas de conversations archivées."
                          : "Vous n'avez pas encore de conversations."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Détail de la conversation - Version mobile */}
          <div className={`flex-1 ${mobileView === 'list' ? 'hidden md:block' : ''}`}>
            {selectedConversation ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col">
                {/* En-tête de la conversation */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Bouton retour mobile */}
                    <button
                      className="md:hidden inline-flex items-center p-2 mr-2 rounded-lg text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileView('list')}
                    >
                      <FiArrowLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Info du client */}
                    {(() => {
                      const client = selectedConversation.participants.find(user => user.id !== 'USR-001');
                      if (!client) return null;
                      
                      return (
                        <div className="flex items-center">
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
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h3 className="text-sm font-semibold text-gray-900">{client.username}</h3>
                              {client.isVerified && (
                                <FiCheck className="ml-1 h-3 w-3 text-green-500" />
                              )}
                              {client.isOnline && (
                                <span className="ml-2 text-xs text-green-600 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                                  En ligne
                                </span>
                              )}
                            </div>
                            {selectedConversation.order && (
                              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <FiShoppingBag className="h-3 w-3 mr-1" />
                                {selectedConversation.order.title}
                                <span className="mx-1.5">•</span>
                                {getOrderStatusBadge(selectedConversation.order.status)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center">
                    <Link
                      href={selectedConversation.order ? `/dashboard/orders/${selectedConversation.order.id}` : '#'}
                      className={`mr-2 flex items-center px-3 py-1.5 rounded-lg text-sm ${
                        selectedConversation.order 
                          ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <FiShoppingBag className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">Voir la commande</span>
                    </Link>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      onClick={() => {
                        // Ouvrir le menu d'actions
                      }}
                    >
                      <FiMoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Zone de messages */}
                <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                  <div className="text-center text-sm text-gray-500 my-4">
                    Début de la conversation
                  </div>
                  
                  {/* Simulation de quelques messages */}
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">
                          {selectedConversation.participants.find(user => user.id !== 'USR-001')?.username.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 max-w-[80%]">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <p className="text-gray-800 text-sm">Bonjour, je souhaiterais avoir plus d'informations concernant votre service de conception de logo.</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-2">
                          {formatMessageDate('2023-08-10T10:30:00')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start flex-row-reverse">
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-xs">
                          Moi
                        </div>
                      </div>
                      <div className="flex-1 max-w-[80%]">
                        <div className="bg-indigo-50 rounded-xl p-3 shadow-sm">
                          <p className="text-gray-800 text-sm">Bonjour et merci pour votre message ! Je serais ravi de vous donner plus d'informations. Que voulez-vous savoir exactement ?</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 mr-2 text-right">
                          {formatMessageDate('2023-08-10T10:45:00')} 
                          <span className="ml-1 text-indigo-600">✓</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">
                          {selectedConversation.participants.find(user => user.id !== 'USR-001')?.username.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 max-w-[80%]">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <p className="text-gray-800 text-sm">J'aimerais connaître les différentes formules, si vous proposez des révisions illimitées, et quel est le délai de livraison.</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-2">
                          {formatMessageDate('2023-08-10T11:15:00')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Zone de saisie */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <FiPaperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 mx-2">
                      <input
                        type="text"
                        placeholder="Écrivez votre message..."
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <button
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4 py-8">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <FiMessageSquare className="w-12 h-12 text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Vos conversations</h2>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Sélectionnez une conversation dans la liste pour voir les messages ou créez une nouvelle conversation.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link 
                    href="/dashboard/messages/new" 
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-indigo-100"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Nouvelle conversation
                  </Link>
                  
                  <Link 
                    href="/dashboard/orders" 
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    <FiShoppingBag className="h-4 w-4 mr-2" />
                    Voir mes commandes
                  </Link>
                </div>
                
                {filteredConversations.length > 0 && (
                  <div className="mt-12 border-t border-gray-200 pt-8 w-full max-w-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Conversations récentes</h3>
                    <div className="space-y-3">
                      {filteredConversations.slice(0, 3).map((conversation) => {
                        const client = conversation.participants.find(user => user.id !== 'USR-001');
                        if (!client) return null;
                        
                        return (
                          <div
                            key={conversation.id}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                            onClick={() => {
                              setSelectedConversation(conversation);
                              setMobileView('detail');
                            }}
                          >
                            <div className="flex items-center">
                              {client.avatar ? (
                                <img 
                                  src={client.avatar} 
                                  alt={client.username} 
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                  {client.username.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{client.username}</h4>
                                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                  {conversation.lastMessage?.content}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {conversation.unreadCount > 0 && (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                                  {conversation.unreadCount}
                                </div>
                              )}
                              <FiChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;