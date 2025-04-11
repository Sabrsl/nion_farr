import React, { useState, useEffect } from 'react';
import { FiSearch, FiMessageSquare, FiUser, FiClock, FiStar, FiEdit, FiTrash2, FiMail } from 'react-icons/fi/index.js';
import AdminLayout from '../../components/layouts/AdminLayout';

// Types pour les messages
interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: 'client' | 'freelancer' | 'admin';
  };
  recipient: {
    id: string;
    name: string;
    avatar: string;
    role: 'client' | 'freelancer' | 'admin';
  };
  subject: string;
  content: string;
  isRead: boolean;
  timestamp: string;
  category: 'support' | 'dispute' | 'general' | 'system';
}

// Données de test
const mockMessages: Message[] = [
  {
    id: '1',
    sender: {
      id: 'c1',
      name: 'Sophie Martin',
      avatar: '/images/avatar-1.jpg',
      role: 'client'
    },
    recipient: {
      id: 'admin',
      name: 'Admin',
      avatar: '/images/admin-avatar.jpg',
      role: 'admin'
    },
    subject: 'Problème avec un paiement',
    content: 'Bonjour, je n\'arrive pas à finaliser mon paiement pour le service de développement web. Pouvez-vous m\'aider ?',
    isRead: false,
    timestamp: '2023-11-05T10:30:00Z',
    category: 'support'
  },
  {
    id: '2',
    sender: {
      id: 'f1',
      name: 'Thomas Dubois',
      avatar: '/images/avatar-2.jpg',
      role: 'freelancer'
    },
    recipient: {
      id: 'admin',
      name: 'Admin',
      avatar: '/images/admin-avatar.jpg',
      role: 'admin'
    },
    subject: 'Validation de mon service',
    content: 'Bonjour, j\'ai soumis mon service de design graphique il y a 3 jours mais il n\'est toujours pas validé. Pouvez-vous vérifier ?',
    isRead: true,
    timestamp: '2023-11-04T14:45:00Z',
    category: 'general'
  },
  {
    id: '3',
    sender: {
      id: 'c2',
      name: 'Marc Petit',
      avatar: '/images/avatar-3.jpg',
      role: 'client'
    },
    recipient: {
      id: 'admin',
      name: 'Admin',
      avatar: '/images/admin-avatar.jpg',
      role: 'admin'
    },
    subject: 'Litige avec un freelancer',
    content: 'Le freelancer n\'a pas respecté les délais convenus pour mon projet de traduction. Je demande un remboursement.',
    isRead: true,
    timestamp: '2023-11-03T09:20:00Z',
    category: 'dispute'
  },
  {
    id: '4',
    sender: {
      id: 'system',
      name: 'Système',
      avatar: '/images/system-avatar.jpg',
      role: 'admin'
    },
    recipient: {
      id: 'admin',
      name: 'Admin',
      avatar: '/images/admin-avatar.jpg',
      role: 'admin'
    },
    subject: 'Alerte de sécurité',
    content: 'Plusieurs tentatives de connexion infructueuses ont été détectées pour le compte admin. Veuillez vérifier les journaux de sécurité.',
    isRead: false,
    timestamp: '2023-11-02T23:15:00Z',
    category: 'system'
  },
  {
    id: '5',
    sender: {
      id: 'f3',
      name: 'Amélie Bernard',
      avatar: '/images/avatar-5.jpg',
      role: 'freelancer'
    },
    recipient: {
      id: 'admin',
      name: 'Admin',
      avatar: '/images/admin-avatar.jpg',
      role: 'admin'
    },
    subject: 'Question sur les commissions',
    content: 'Bonjour, je voudrais savoir comment sont calculées les commissions sur les services premium. Merci d\'avance.',
    isRead: true,
    timestamp: '2023-11-01T16:50:00Z',
    category: 'general'
  }
];

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setMessages(mockMessages);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filtrer les messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || message.category === selectedCategory;
    
    const matchesStatus = !selectedStatus || 
                          (selectedStatus === 'read' && message.isRead) ||
                          (selectedStatus === 'unread' && !message.isRead);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Statistiques
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(m => !m.isRead).length;
  const supportMessages = messages.filter(m => m.category === 'support').length;
  const disputeMessages = messages.filter(m => m.category === 'dispute').length;
  
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    
    // Marquer comme lu si non lu
    if (!message.isRead) {
      setMessages(prev => 
        prev.map(m => 
          m.id === message.id ? { ...m, isRead: true } : m
        )
      );
    }
  };
  
  const handleDeleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      setMessages(prev => prev.filter(message => message.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Gestion des Messages</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Gestion des Messages</h1>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiMessageSquare className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Total Messages</h3>
                <p className="text-2xl font-semibold">{totalMessages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <FiMail className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Non Lus</h3>
                <p className="text-2xl font-semibold">{unreadMessages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FiUser className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Support</h3>
                <p className="text-2xl font-semibold">{supportMessages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiStar className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Litiges</h3>
                <p className="text-2xl font-semibold">{disputeMessages}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher des messages..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-48">
                <select
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  <option value="support">Support</option>
                  <option value="dispute">Litiges</option>
                  <option value="general">Général</option>
                  <option value="system">Système</option>
                </select>
              </div>
              
              <div className="w-48">
                <select
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="read">Lus</option>
                  <option value="unread">Non lus</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interface de messagerie */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex h-[600px]">
            {/* Liste des messages */}
            <div className="w-full md:w-1/3 border-r overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`border-b cursor-pointer ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    } ${!message.isRead ? 'bg-gray-50' : ''}`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center">
                          <img
                            src={message.sender.avatar || '/images/avatar-placeholder.jpg'}
                            alt={message.sender.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <h3 className={`font-medium ${!message.isRead ? 'font-semibold' : ''}`}>
                            {message.sender.name}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className={`text-sm ${!message.isRead ? 'font-semibold' : 'text-gray-600'}`}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {message.content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          message.category === 'support' ? 'bg-green-100 text-green-800' :
                          message.category === 'dispute' ? 'bg-red-100 text-red-800' :
                          message.category === 'system' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {message.category === 'support' ? 'Support' :
                           message.category === 'dispute' ? 'Litige' :
                           message.category === 'system' ? 'Système' : 'Général'}
                        </span>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <FiMessageSquare className="text-gray-400 text-5xl mb-4" />
                  <p className="text-gray-500">Aucun message ne correspond à vos critères</p>
                </div>
              )}
            </div>
            
            {/* Détails du message */}
            <div className="hidden md:flex flex-col w-2/3">
              {selectedMessage ? (
                <>
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                      <div className="flex space-x-2">
                        <button className="text-gray-500 hover:text-gray-700">
                          <FiEdit size={18} />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => handleDeleteMessage(selectedMessage.id, e)}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <img
                        src={selectedMessage.sender.avatar || '/images/avatar-placeholder.jpg'}
                        alt={selectedMessage.sender.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium">{selectedMessage.sender.name}</div>
                        <div className="text-sm text-gray-500">
                          {selectedMessage.sender.role === 'client' ? 'Client' : 
                           selectedMessage.sender.role === 'freelancer' ? 'Freelancer' : 'Admin'}
                        </div>
                      </div>
                      <div className="ml-auto text-sm text-gray-500">
                        {formatDate(selectedMessage.timestamp)}
                      </div>
                    </div>
                    
                    <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedMessage.category === 'support' ? 'bg-green-100 text-green-800' :
                      selectedMessage.category === 'dispute' ? 'bg-red-100 text-red-800' :
                      selectedMessage.category === 'system' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMessage.category === 'support' ? 'Support' :
                       selectedMessage.category === 'dispute' ? 'Litige' :
                       selectedMessage.category === 'system' ? 'Système' : 'Général'}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-line">{selectedMessage.content}</p>
                  </div>
                  
                  <div className="p-6 border-t">
                    <h3 className="font-medium mb-3">Répondre</h3>
                    <textarea
                      className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Écrivez votre réponse ici..."
                    ></textarea>
                    <div className="flex justify-end mt-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        Envoyer
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <FiMessageSquare className="text-gray-400 text-5xl mb-4" />
                  <p className="text-gray-500">Sélectionnez un message pour voir les détails</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessagesPage; 