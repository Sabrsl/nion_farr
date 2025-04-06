import React, { useState } from 'react';
import { FiMoreHorizontal, FiArchive, FiFlag, FiX, FiChevronLeft, FiClock, FiCheck, FiStar, FiPhone, FiVideo } from 'react-icons/fi';
import { Conversation, User } from '../../types';

interface ConversationHeaderProps {
  conversation: Conversation;
  recipient: User;
  onBack?: () => void;
  onArchive?: () => void;
  onReport?: () => void;
  showBackButton?: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  recipient,
  onBack,
  onArchive,
  onReport,
  showBackButton = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Calculer le temps de réponse moyen (en heures)
  const getAverageResponseTime = () => {
    const responseTime = recipient.averageResponseTime || Math.floor(Math.random() * 24) + 1;
    
    if (responseTime < 1) {
      return 'quelques minutes';
    } else if (responseTime === 1) {
      return 'environ 1 heure';
    } else if (responseTime < 24) {
      return `environ ${responseTime} heures`;
    } else {
      const days = Math.floor(responseTime / 24);
      return days === 1 ? 'environ 1 jour' : `environ ${days} jours`;
    }
  };
  
  // Formater le statut de la commande
  const getOrderStatus = () => {
    if (!conversation.order) return null;
    
    const statusMap: Record<string, { label: string, className: string }> = {
      'pending': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Terminé', className: 'bg-green-100 text-green-800' },
      'revision': { label: 'En révision', className: 'bg-purple-100 text-purple-800' },
      'cancelled': { label: 'Annulé', className: 'bg-red-100 text-red-800' },
      
      // Traductions françaises
      'en_attente': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      'en_cours': { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
      'terminé': { label: 'Terminé', className: 'bg-green-100 text-green-800' },
      'terminée': { label: 'Terminée', className: 'bg-green-100 text-green-800' },
      'révision': { label: 'Révision', className: 'bg-purple-100 text-purple-800' },
      'annulé': { label: 'Annulé', className: 'bg-red-100 text-red-800' },
      'annulée': { label: 'Annulée', className: 'bg-red-100 text-red-800' }
    };
    
    const status = conversation.order.status?.toLowerCase() || 'pending';
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };
  
  return (
    <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
      {/* Informations sur le contact */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button 
            onClick={onBack} 
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {/* Avatar */}
        <div className="relative">
          {recipient.avatar ? (
            <img 
              src={recipient.avatar} 
              alt={recipient.name || recipient.username || 'Contact'} 
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/avatar-placeholder.jpg';
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              {(recipient.name || recipient.username || 'C').charAt(0)}
            </div>
          )}
          
          {recipient.isOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
          )}
        </div>
        
        {/* Informations du contact */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center">
            <h2 className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {recipient.name || recipient.username}
            </h2>
            {recipient.isVerified && (
              <span className="ml-1.5 text-blue-500">
                <FiCheck className="h-4 w-4" />
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {recipient.isOnline ? (
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                En ligne
              </span>
            ) : recipient.lastActive ? (
              <span className="flex items-center">
                <FiClock className="mr-1 h-3 w-3" />
                Actif {recipient.lastActive}
              </span>
            ) : (
              <span className="flex items-center">
                <FiClock className="mr-1 h-3 w-3" />
                Temps de réponse: {getAverageResponseTime()}
              </span>
            )}
            
            {/* Statut de commande s'il y en a une */}
            {conversation.order && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 truncate">
                  {conversation.order.title}
                  {getOrderStatus()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Boutons d'appel (désactivés pour l'instant) */}
        <button 
          disabled
          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 opacity-50 cursor-not-allowed hidden sm:block"
          title="Appel audio (bientôt disponible)"
        >
          <FiPhone className="h-5 w-5" />
        </button>
        
        <button 
          disabled
          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 opacity-50 cursor-not-allowed hidden sm:block"
          title="Appel vidéo (bientôt disponible)"
        >
          <FiVideo className="h-5 w-5" />
        </button>
        
        {/* Menu d'options */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <FiMoreHorizontal className="h-5 w-5" />
          </button>
          
          {menuOpen && (
            <>
              {/* Overlay pour fermer le menu en cliquant en dehors */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setMenuOpen(false)}
              ></div>
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                {onArchive && (
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FiArchive className="mr-3 h-4 w-4 text-gray-500" />
                    {conversation.isActive === false ? 'Désarchiver' : 'Archiver'}
                  </button>
                )}
                
                {/* Marquer comme favori (placaholder) */}
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiStar className="mr-3 h-4 w-4 text-gray-500" />
                  Marquer comme favori
                </button>
                
                {onReport && (
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      onReport();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <FiFlag className="mr-3 h-4 w-4" />
                    Signaler un problème
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader; 