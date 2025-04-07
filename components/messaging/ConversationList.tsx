import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FiSearch, 
  FiX, 
  FiPlus, 
  FiShoppingBag, 
  FiChevronRight, 
  FiInbox, 
  FiMail, 
  FiArchive,
  FiCheck,
  FiClock
} from 'react-icons/fi';
import { Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation?: () => void;
  isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'active' | 'archived'>('all');
  
  // Stats des conversations
  const conversationStats = {
    total: conversations.length,
    unread: conversations.filter(c => c.unreadCount > 0).length,
    active: conversations.filter(c => c.isActive).length,
    archived: conversations.filter(c => !c.isActive).length
  };
  
  // Filtrer les conversations selon le filtre sélectionné et la recherche
  const filteredConversations = conversations.filter(conversation => {
    // Filtre selon le type (all, unread, active, archived)
    if (selectedFilter === 'unread' && conversation.unreadCount === 0) {
      return false;
    }
    if (selectedFilter === 'active' && !conversation.isActive) {
      return false;
    }
    if (selectedFilter === 'archived' && conversation.isActive !== false) {
      return false;
    }
    
    // Recherche textuelle
    if (searchQuery) {
      // Rechercher dans le nom des participants
      const participantsMatch = conversation.participants.some(participant => {
        if (typeof participant === 'string') {
          return participant.toLowerCase().includes(searchQuery.toLowerCase());
        }
        // Utiliser l'opérateur d'indexation pour accéder aux propriétés
        if (participant && typeof participant === 'object') {
          const participantObj = participant as Record<string, any>;
          const name = participantObj['name'] as string | undefined;
          const username = participantObj['username'] as string | undefined;
          return (name && name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                (username && username.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return false;
      });
      
      // Rechercher dans le dernier message
      const lastMessageMatch = conversation.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Rechercher dans le titre de la commande associée
      const orderMatch = conversation.order?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return participantsMatch || lastMessageMatch || orderMatch;
    }
    
    return true;
  });
  
  // Formatter la date relative
  const formatMessageDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Si aujourd'hui, afficher l'heure
      if (date.toDateString() === new Date().toDateString()) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
      
      // Sinon, utiliser une formulation relative
      return formatDistanceToNow(date, { locale: fr, addSuffix: true });
    } catch (error) {
      return '';
    }
  };
  
  // Obtenir un badge de statut pour une commande
  const getOrderStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap: Record<string, { label: string; className: string }> = {
      'pending': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Terminé', className: 'bg-green-100 text-green-800' },
      'revision': { label: 'En révision', className: 'bg-purple-100 text-purple-800' },
      'cancelled': { label: 'Annulé', className: 'bg-red-100 text-red-800' },
      'potential': { label: 'Potentiel', className: 'bg-gray-100 text-gray-800' },
      
      // Traduction française
      'en_attente': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      'en_cours': { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
      'terminé': { label: 'Terminé', className: 'bg-green-100 text-green-800' },
      'terminée': { label: 'Terminée', className: 'bg-green-100 text-green-800' },
      'révision_demandée': { label: 'Révision', className: 'bg-purple-100 text-purple-800' },
      'annulé': { label: 'Annulé', className: 'bg-red-100 text-red-800' },
      'annulée': { label: 'Annulée', className: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-1.5 py-0.5 text-xs rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Barre de recherche et filtres */}
      <div className="p-4 border-b border-gray-200">
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
        
        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
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
        {onNewConversation && (
          <div className="mt-4">
            <button 
              onClick={onNewConversation}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              <span>Nouvelle conversation</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Liste des conversations */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="animate-pulse p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FiInbox className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">Aucune conversation</h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery 
                ? 'Aucun résultat pour cette recherche' 
                : selectedFilter === 'unread' 
                  ? 'Vous n\'avez pas de messages non lus'
                  : selectedFilter === 'archived'
                    ? 'Vous n\'avez pas de conversations archivées'
                    : 'Commencez à échanger des messages'}
            </p>
            {onNewConversation && (
              <button 
                onClick={onNewConversation}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FiPlus className="h-4 w-4" />
                <span>Nouvelle conversation</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              // Récupérer l'autre participant (non USR-001)
              const client = conversation.participants.find(user =>
                typeof user === 'object' && user !== null && (user as Record<string, any>)['id'] !== 'USR-001'
              );

              if (!client || typeof client !== 'object') return null;
              
              return (
                <div 
                  key={conversation.id} 
                  id={`conversation-${client.id}`}
                  className={`relative cursor-pointer transition-colors ${
                    activeConversationId === conversation.id 
                      ? 'bg-indigo-50' 
                      : conversation.unreadCount > 0 
                        ? 'bg-indigo-50/40 hover:bg-indigo-50/60' 
                        : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="p-4 relative">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 relative">
                        {client.avatar ? (
                          <img 
                            src={client.avatar} 
                            alt={client.username || client.name} 
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback si l'image ne charge pas
                              (e.target as HTMLImageElement).src = '/images/avatar-placeholder.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                            {(client.username || client.name || 'U').charAt(0)}
                          </div>
                        )}
                        {client.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900 truncate flex items-center">
                            {client.name || client.username}
                            {client.isVerified && (
                              <FiCheck className="ml-1 h-3.5 w-3.5 text-blue-500" />
                            )}
                          </h4>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500">
                              {formatMessageDate(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <span className="mt-1 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full min-w-[1.25rem] text-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Dernier message */}
                        <p className="text-sm text-gray-600 truncate mt-0.5">
                          {conversation.lastMessage?.content || 'Nouvelle conversation'}
                        </p>
                        
                        {/* Commande liée */}
                        {conversation.order && (
                          <div className="flex items-center mt-1.5 gap-1.5">
                            <FiShoppingBag className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 truncate mr-1">
                              {conversation.order.title}
                            </span>
                            {getOrderStatusBadge(conversation.order.status)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 self-center ml-1">
                        <FiChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList; 