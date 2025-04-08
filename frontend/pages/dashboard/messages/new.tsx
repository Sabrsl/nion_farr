import { 
  FiArrowLeft, 
  FiSend, 
  FiSearch, 
  FiX, 
  FiUser, 
  FiShoppingBag,
  FiCheck,
  FiMessageSquare,
  FiPaperclip,
  FiPlus
} from 'react-icons/fi';

import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import FileUploader from '../../../components/dashboard/FileUploader';
import { User, Order } from '../../../types';
// Remplacer l'importation par une constante locale
// import { freelancerOrders } from '../../../data/mockData';

// Données de commandes vides
const freelancerOrders: Order[] = [];

// Créer un objet mockUsers localement
const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Amadou Diop',
    email: 'amadou.diop@example.com',
    role: 'provider',
    isVerified: true,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'AmadouD',
    createdAt: '2022-05-10'
  },
  {
    id: 'USR-002',
    name: 'Fatou Diallo',
    email: 'fatou.diallo@example.com',
    role: 'client',
    isVerified: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    username: 'FatouD',
    createdAt: '2022-07-15'
  }
];

const NewConversationPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'select-user' | 'select-order' | 'write-message'>('select-user');
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    // Simuler le chargement des données
    const fetchData = async () => {
      try {
        // Simulation d'une requête API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dans une application réelle, ces données viendraient d'une API
        setAvailableUsers(mockUsers.filter(user => user.id !== 'USR-001'));
        setOrders(freelancerOrders);
        
        // Vérifier si un recipient est spécifié dans l'URL
        const { recipient } = router.query;
        if (recipient && typeof recipient === 'string') {
          // Trouver l'utilisateur correspondant dans la liste des utilisateurs disponibles
          const user = mockUsers.find(u => u.id === recipient);
          if (user) {
            // Sélectionner l'utilisateur
            setSelectedUser(user);
            
            // Vérifier si l'utilisateur a des commandes
            const userOrders = freelancerOrders.filter((order: Order) => order.client.id === user.id);
            if (userOrders.length > 0) {
              setStep('select-order');
            } else {
              setStep('write-message');
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router.query]);

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

  // Filtrage des utilisateurs avec vérification pour username
  const filteredUsers = searchQuery 
    ? availableUsers.filter(user => 
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableUsers;
  
  // Filtrage des commandes par utilisateur sélectionné
  const filteredOrders = selectedUser 
    ? orders.filter(order => order.client.id === selectedUser.id)
    : [];

  // Fonction pour gérer la sélection d'un utilisateur
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    
    // Si l'utilisateur a des commandes, passer à l'étape de sélection de commande
    // Sinon, passer directement à l'étape de rédaction de message
    const userOrders = orders.filter((order: Order) => order.client.id === user.id);
    if (userOrders.length > 0) {
      setStep('select-order');
    } else {
      setStep('write-message');
    }
  };

  // Fonction pour gérer la sélection d'une commande
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setStep('write-message');
  };

  // Fonction pour envoyer un message
  const handleSendMessage = () => {
    if (!message.trim() && attachments.length === 0) return;
    if (isSending) return;
    
    // Indiquer que l'envoi est en cours
    setIsSending(true);
    
    // Simuler le traitement et l'envoi
    setTimeout(() => {
      // Dans une application réelle, vous enverriez le message et les pièces jointes via une API
      router.push('/dashboard/messages');
    }, 1500);
  };

  // Animation de chargement
  if (isLoading) {
    return (
      <DashboardLayout title="Nouvelle conversation | NionFar.sn">
        <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1200px] mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 mt-4 sm:mt-6 lg:mt-8"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-10 bg-gray-200 rounded-lg w-full mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Nouvelle conversation | NionFar.sn">
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1200px] mx-auto">
        {/* En-tête avec lien de retour */}
        <div className="flex items-center justify-between mb-6 mt-4 sm:mt-6 lg:mt-8">
          <Link href="/dashboard/messages" className="flex items-center text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Retour aux messages</span>
          </Link>
          
          {step !== 'select-user' && (
            <button 
              onClick={() => setStep(step === 'write-message' ? 'select-order' : 'select-user')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Étape précédente
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête avec étapes */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Nouvelle conversation</h1>
            <div className="flex flex-wrap items-center text-sm mt-2 gap-y-2">
              <div className={`flex items-center ${step === 'select-user' ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step === 'select-user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                  <span>1</span>
                </div>
                <span>Sélectionner un contact</span>
              </div>
              <div className={`w-8 h-0.5 mx-2 hidden sm:block ${step === 'select-user' ? 'bg-gray-200' : 'bg-indigo-200'}`}></div>
              <div className={`flex items-center ${step === 'select-order' ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step === 'select-order' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                  <span>2</span>
                </div>
                <span>Lier à une commande</span>
              </div>
              <div className={`w-8 h-0.5 mx-2 hidden sm:block ${step === 'write-message' ? 'bg-indigo-200' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step === 'write-message' ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step === 'write-message' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                  <span>3</span>
                </div>
                <span>Écrire un message</span>
              </div>
            </div>
          </div>
          
          {/* Stepper compact pour mobile */}
          <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: step === 'select-user' ? '33%' : step === 'select-order' ? '66%' : '100%' }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1 px-1">
              <span className={step === 'select-user' ? 'text-indigo-600 font-medium' : 'text-gray-500'}>Étape 1</span>
              <span className={step === 'select-order' ? 'text-indigo-600 font-medium' : 'text-gray-500'}>Étape 2</span>
              <span className={step === 'write-message' ? 'text-indigo-600 font-medium' : 'text-gray-500'}>Étape 3</span>
            </div>
          </div>
          
          <div className="p-6">
            {/* Étape 1: Sélection d'un utilisateur */}
            {step === 'select-user' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sélectionnez un contact</h2>
                
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Rechercher un contact..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                
                {filteredUsers.length > 0 ? (
                  <div className="divide-y divide-gray-100 max-h-[calc(100vh-280px)] overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-left"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="flex-shrink-0 relative">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.username?.charAt(0) || user.name?.charAt(0) || 'U'} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                              {user.username?.charAt(0) || user.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          {user.isVerified && (
                            <div className="absolute -right-0.5 -bottom-0.5 bg-green-500 p-0.5 rounded-full border-2 border-white">
                              <FiCheck className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-base font-medium text-gray-900">{user.username || user.name}</h3>
                          <p className="text-sm text-gray-500">
                            {orders.some(order => order.client.id === user.id)
                              ? 'Client avec commande(s)'
                              : 'Contact'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiUser className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucun contact trouvé</h3>
                    <p className="text-gray-500 mt-2">
                      {searchQuery 
                        ? "Aucun contact ne correspond à votre recherche."
                        : "Vous n'avez pas encore de contacts."}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Étape 2: Sélection d'une commande (si l'utilisateur a des commandes) */}
            {step === 'select-order' && selectedUser && (
              <div>
                <div className="flex items-center mb-6">
                  <button 
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                    onClick={() => setStep('select-user')}
                  >
                    <FiArrowLeft className="h-4 w-4 mr-1" />
                    <span>Retour</span>
                  </button>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 relative">
                    {selectedUser.avatar ? (
                      <img 
                        src={selectedUser.avatar} 
                        alt={selectedUser.username?.charAt(0) || selectedUser.name?.charAt(0) || 'U'} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                        {selectedUser.username?.charAt(0) || selectedUser.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    {selectedUser.isVerified && (
                      <div className="absolute -right-0.5 -bottom-0.5 bg-green-500 p-0.5 rounded-full border-2 border-white">
                        <FiCheck className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{selectedUser.username || selectedUser.name}</h2>
                    <p className="text-sm text-gray-500">Sélectionnez une commande ou continuez sans en sélectionner</p>
                  </div>
                </div>
                
                <h3 className="text-base font-medium text-gray-900 mb-4">Commandes associées</h3>
                
                {filteredOrders.length > 0 ? (
                  <div className="space-y-3 mb-6 max-h-[calc(100vh-320px)] overflow-y-auto">
                    {filteredOrders.map((order) => (
                      <button
                        key={order.id}
                        className="flex items-center w-full p-4 hover:bg-gray-50 text-left border border-gray-200 rounded-lg"
                        onClick={() => handleSelectOrder(order)}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <FiShoppingBag className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-base font-medium text-gray-900">{order.title}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">#{order.id}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full
                                ${order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                                ${order.status === 'revision' ? 'bg-purple-100 text-purple-700' : ''}
                                ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                              `}>
                                {order.status === 'in_progress' && 'En cours'}
                                {order.status === 'pending' && 'En attente'}
                                {order.status === 'completed' && 'Terminé'}
                                {order.status === 'revision' && 'Révision'}
                                {order.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{order.price.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-gray-200 rounded-lg mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
                    <p className="text-gray-500 mt-2">
                      Ce contact n'a pas de commandes actives avec vous.
                    </p>
                  </div>
                )}
                
                <button
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
                  onClick={() => setStep('write-message')}
                >
                  Continuer sans sélectionner de commande
                </button>
              </div>
            )}
            
            {/* Étape 3: Rédaction du message */}
            {step === 'write-message' && selectedUser && (
              <div>
                <div className="flex items-center mb-6">
                  <button 
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                    onClick={() => setStep(selectedOrder ? 'select-order' : 'select-user')}
                  >
                    <FiArrowLeft className="h-4 w-4 mr-1" />
                    <span>Retour</span>
                  </button>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 relative">
                    {selectedUser.avatar ? (
                      <img 
                        src={selectedUser.avatar} 
                        alt={selectedUser.username?.charAt(0) || selectedUser.name?.charAt(0) || 'U'} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                        {selectedUser.username?.charAt(0) || selectedUser.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    {selectedUser.isVerified && (
                      <div className="absolute -right-0.5 -bottom-0.5 bg-green-500 p-0.5 rounded-full border-2 border-white">
                        <FiCheck className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{selectedUser.username || selectedUser.name}</h2>
                    {selectedOrder ? (
                      <div className="flex items-center text-sm text-gray-500">
                        <FiShoppingBag className="h-3.5 w-3.5 mr-1" />
                        <span>{selectedOrder.title}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nouvelle conversation</p>
                    )}
                  </div>
                </div>
                
                <h3 className="text-base font-medium text-gray-900 mb-4">Écrivez votre message</h3>
                
                <div className="mb-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre premier message..."
                    className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={6}
                  />
                </div>

                {/* Bouton pour joindre des fichiers */}
                <div className="mb-5">
                  {!showFileUploader ? (
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Opening file uploader");
                        setShowFileUploader(true);
                      }}
                      className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-indigo-600 hover:text-indigo-800 font-medium text-sm rounded-lg transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      <FiPaperclip className="mr-2 h-5 w-5" />
                      Joindre des fichiers ou images
                    </button>
                  ) : (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                      
                      {attachments.length > 0 && (
                        <div className="mt-3 text-xs text-gray-500">
                          {attachments.length} fichier(s) sélectionné(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                  Soyez précis et courtois dans votre message. Fournissez autant de détails que possible.
                </p>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={(!message.trim() && attachments.length === 0) || isSending}
                    className={`flex items-center px-6 py-3 rounded-lg ${
                      isSending
                        ? 'bg-indigo-500 text-white cursor-not-allowed'
                        : message.trim() || attachments.length > 0
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <FiSend className="h-5 w-5 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer avec actions */}
          <div className="border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50">
            <div className="text-sm text-gray-500 w-full sm:w-auto">
              <span className="hidden sm:inline">Étape </span>
              {step === 'select-user' && 'Sélectionnez un contact pour continuer'}
              {step === 'select-order' && 'Liez à une commande ou passez à l\'étape suivante'}
              {step === 'write-message' && (
                <span>
                  Discussion avec{' '}
                  <span className="font-medium text-gray-700">{selectedUser?.username || selectedUser?.name}</span>
                  {selectedOrder && (
                    <>
                      {' '}à propos de la commande{' '}
                      <span className="font-medium text-gray-700">#{selectedOrder.id}</span>
                    </>
                  )}
                </span>
              )}
            </div>
            
            {step === 'select-order' && (
              <button
                onClick={() => setStep('write-message')}
                className="px-4 py-2 w-full sm:w-auto bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continuer sans commande
              </button>
            )}
            
            {step === 'write-message' && (
              <button
                onClick={handleSendMessage}
                disabled={(!message.trim() && attachments.length === 0) || isSending}
                className={`px-4 py-2 w-full sm:w-auto text-white text-sm font-medium rounded-lg flex items-center justify-center transition-all ${
                  (!message.trim() && attachments.length === 0) || isSending
                    ? 'bg-gray-400 cursor-not-allowed opacity-70'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer <FiSend className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Bouton flottant sur mobile pour faciliter la navigation entre les étapes */}
        <div className="fixed bottom-20 right-4 sm:hidden z-50">
          {step === 'select-user' && filteredUsers.length > 0 && (
            <button
              onClick={() => handleSelectUser(filteredUsers[0])}
              className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all"
            >
              <FiArrowLeft className="h-5 w-5 transform rotate-180" />
            </button>
          )}
          
          {step === 'select-order' && (
            <button
              onClick={() => setStep('write-message')}
              className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all"
            >
              <FiArrowLeft className="h-5 w-5 transform rotate-180" />
            </button>
          )}
          
          {step === 'write-message' && (
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && attachments.length === 0) || isSending}
              className={`p-4 rounded-full shadow-lg transition-all ${
                (!message.trim() && attachments.length === 0) || isSending
                  ? 'bg-gray-400 opacity-70'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <FiSend className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewConversationPage; 