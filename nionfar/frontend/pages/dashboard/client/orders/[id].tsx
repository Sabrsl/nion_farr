import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FiDownload, 
  FiCheck, 
  FiMessageSquare, 
  FiAlertTriangle, 
  FiStar, 
  FiEdit3, 
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiUser,
  FiPackage,
  FiFileText,
  FiSend
} from 'react-icons/fi';
import ClientDashboardLayout from '../../../../components/dashboard/ClientDashboardLayout';
import Link from 'next/link';
import { Order, OrderStatus } from '../../../../types';

const OrderDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString() + ' FCFA';
  };
  
  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (!id) return;

    // Simuler le chargement des données
    const timer = setTimeout(() => {
      // Commande fictive pour démonstration
      const mockOrder = {
        id: 'ORD-123456',
        serviceId: 'SRV-789',
        serviceName: 'Création de logo professionnel',
        providerId: 'PRV-001',
        providerName: 'Amadou Diop',
        providerAvatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        clientId: 'CLT-001',
        status: 'livré' as OrderStatus,
        price: 25000,
        orderDate: '2023-08-15',
        expectedDeliveryDate: '2023-08-20',
        deliveryDate: '2023-08-17',
        title: 'Création de logo pour restaurant',
        createdAt: '2023-08-15',
        deadline: '2023-08-20',
        isPaid: true,
        requirements: 'Création d\'un logo moderne pour restaurant avec des couleurs chaudes (orange, rouge). Style épuré et minimaliste. Format vectoriel et PNG transparent. Trois propositions différentes.',
        messages: [
          {
            id: 'MSG-001',
            sender: 'client',
            content: 'Bonjour, je suis impatient de voir votre travail pour mon logo.',
            createdAt: '2023-08-15T09:30:00',
            isRead: true
          },
          {
            id: 'MSG-002',
            sender: 'provider',
            content: 'Bonjour ! Merci pour votre commande. Je vais commencer à travailler sur votre logo dès aujourd\'hui. Avez-vous des exemples de logos que vous aimez?',
            createdAt: '2023-08-15T10:15:00',
            isRead: true
          },
          {
            id: 'MSG-003',
            sender: 'provider',
            content: 'Quel style préférez-vous? Minimaliste, coloré, vintage?',
            createdAt: '2023-08-15T10:20:00',
            isRead: true
          },
          {
            id: 'MSG-004',
            sender: 'client',
            content: 'Oui, j\'aime les logos minimalistes avec des couleurs chaudes comme l\'orange et le rouge.',
            createdAt: '2023-08-15T13:45:00',
            isRead: true
          }
        ],
        deliverables: [
          {
            id: 'DEL-001',
            name: 'Logo design v1',
            url: 'https://example.com/files/logo_v1.zip',
            orderId: id as string,
            message: 'Voici la première version de votre logo. J\'attends vos retours.',
            fileUrls: ['https://example.com/files/logo_v1.zip'],
            createdAt: '2023-08-17T16:20:00'
          }
        ],
        
        // Informations additionnelles pour l'affichage
        service: {
          id: 'SRV-789',
          title: 'Création de logo professionnel',
          description: 'Je crée des logos professionnels et modernes adaptés à votre identité de marque.',
          category: 'Design Graphique',
          image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          provider: {
            id: 'PRV-001',
            name: 'Amadou Diop',
            rating: 4.9
          },
          price: 25000,
          deliveryTime: 5,
          revisions: 3,
          rating: 4.8,
          slug: 'logo-professionnel'
        }
      };
      setOrder(mockOrder);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  // Vérifier si la commande peut être validée (livrée et pas en litige)
  const canAcceptDelivery = order?.status === 'livré';
  
  // Vérifier si une modification peut être demandée
  const canRequestRevision = order?.status === 'livré';
  
  // Vérifier si un litige peut être ouvert
  const canOpenDispute = ['livré', 'en_cours', 'livraison_en_retard'].includes(order?.status as string);
  
  // Vérifier si un avis peut être laissé
  const canLeaveReview = order?.status === 'terminée' || order?.status === 'terminé';

  // Gérer la validation de la livraison
  const handleAcceptDelivery = () => {
    if (!canAcceptDelivery) return;
    
    // Appel API pour valider la livraison
    console.log('Validation de la livraison...');
    
    // Simuler la mise à jour du statut
    setOrder(prev => prev ? {
      ...prev,
      status: 'terminée'
    } : null);
  };

  // Gérer l'envoi d'un message
  const handleSendMessage = () => {
    if (!message.trim() || !order) return;
    
    // Simuler l'envoi d'un message
    const newMessage = {
      id: `MSG-${Date.now()}`,
      sender: 'client',
      content: message,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setOrder(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        messages: [...(Array.isArray(prev.messages) ? prev.messages : []), newMessage]
      };
    });
    
    setMessage('');
  };

  if (isLoading) {
    return (
      <ClientDashboardLayout title="Détails de la commande | NionFar.sn">
        <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin mb-4"></div>
              <p className="text-gray-600">Chargement des détails de la commande...</p>
            </div>
          </div>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (!order) {
    return (
      <ClientDashboardLayout title="Commande introuvable | NionFar.sn">
        <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Commande introuvable</h3>
            <p className="text-gray-500 mb-4">La commande que vous recherchez n'existe pas ou vous n'y avez pas accès.</p>
            <Link 
              href="/dashboard/client/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Retour à mes commandes
            </Link>
          </div>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout title={`Commande ${order.id} | NionFar.sn`}>
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <Link 
            href="/dashboard/client/orders"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes commandes
          </Link>
        </div>

        {/* Header de la commande */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{order.title}</h1>
                <span className={`ml-4 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  order.status === 'en_cours' ? 'bg-blue-100 text-blue-800' : 
                  order.status === 'livré' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'terminée' || order.status === 'terminé' ? 'bg-green-100 text-green-800' : 
                  order.status === 'litige' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status === 'en_cours' ? 'En cours' : 
                   order.status === 'livré' ? 'Livré' : 
                   order.status === 'terminée' || order.status === 'terminé' ? 'Terminé' :
                   order.status === 'litige' ? 'Litige' :
                   order.status}
                </span>
              </div>
              <p className="text-gray-500 mt-1">ID: {order.id}</p>
            </div>
            
            {/* Actions principales */}
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              {canAcceptDelivery && (
                <button 
                  onClick={handleAcceptDelivery}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <FiCheck className="mr-2 h-4 w-4" />
                  Accepter la livraison
                </button>
              )}
              
              {canRequestRevision && (
                <Link 
                  href={`/dashboard/client/orders/${order.id}/request-revision`}
                  className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  <FiEdit3 className="mr-2 h-4 w-4" />
                  Demander une modification
                </Link>
              )}
              
              {canOpenDispute && (
                <Link 
                  href={`/dashboard/client/orders/${order.id}/open-dispute`}
                  className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
                >
                  <FiAlertTriangle className="mr-2 h-4 w-4" />
                  Ouvrir un litige
                </Link>
              )}
              
              {canLeaveReview && (
                <Link 
                  href={`/dashboard/client/orders/${order.id}/leave-review`}
                  className="inline-flex items-center px-4 py-2 border border-yellow-600 text-sm font-medium rounded-md text-yellow-600 bg-white hover:bg-yellow-50"
                >
                  <FiStar className="mr-2 h-4 w-4" />
                  Noter le vendeur
                </Link>
              )}
            </div>
          </div>

          {/* Informations générales de la commande */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-3">
                <FiCalendar className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Dates</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date de commande:</span> {formatDate(order.createdAt)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Livraison prévue:</span> {formatDate(order.deadline)}
                </p>
                {(order as any).deliveryValidationDeadline && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date limite de validation:</span> {formatDate((order as any).deliveryValidationDeadline)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-3">
                <FiDollarSign className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Paiement</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Montant:</span> {formatCurrency(order.price)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Statut:</span> {order.isPaid ? 'Payé' : 'En attente'}
                </p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-3">
                <FiUser className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Vendeur</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  {order.service?.provider?.avatar ? (
                    <img 
                      src={order.service.provider.avatar} 
                      alt={order.service.provider.username || "Vendeur"}
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-10 w-10 bg-indigo-100 text-indigo-500">
                      <FiUser className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    {order.service?.provider?.username || order.providerName}
                    {order.service?.provider?.isVerified && (
                      <FiCheck className="ml-1 h-3 w-3 text-green-500" />
                    )}
                  </p>
                  <Link
                    href={`/sellers/${order.service?.provider?.id || order.providerId}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs pour naviguer entre les sections */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aperçu
            </button>
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deliverables'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Livrables
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
            </button>
          </nav>
        </div>

        {/* Contenu des tabs */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description et exigences</h2>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-md font-medium text-gray-900 mb-2">Service commandé</h3>
                <p className="text-gray-700">{order.service.title}</p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Exigences spécifiques</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
                  {order.requirements}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Livrables</h2>
              
              {!order.deliverables || order.deliverables.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPackage className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">Aucun livrable pour le moment</h3>
                  <p className="text-gray-500">Le vendeur n'a pas encore soumis de livraison pour cette commande.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {order.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                              {order.service?.provider?.avatar ? (
                                <img 
                                  src={order.service.provider.avatar} 
                                  alt={order.service.provider.username || "Vendeur"}
                                  className="h-8 w-8 object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-8 w-8 bg-indigo-100 text-indigo-500">
                                  <FiUser className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{order.service?.provider?.username || order.providerName}</p>
                              <p className="text-xs text-gray-500">{deliverable.createdAt ? new Date(deliverable.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}</p>
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                            {deliverable.message}
                          </div>
                        </div>
                      </div>
                      
                      {deliverable.fileUrls && deliverable.fileUrls.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Fichiers</h4>
                          <div className="space-y-2">
                            {deliverable.fileUrls.map((fileUrl, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <FiFileText className="text-indigo-600 mr-2" />
                                  <span className="text-sm text-gray-800">
                                    {fileUrl.split('/').pop()}
                                  </span>
                                </div>
                                <a 
                                  href={fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 border border-indigo-600 text-xs font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                                >
                                  <FiDownload className="mr-1 h-3 w-3" />
                                  Télécharger
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[600px] flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
              
              {/* Messages */}
              <div className="flex-grow overflow-y-auto mb-4 p-2">
                {Array.isArray(order.messages) && order.messages.length > 0 ? (
                  <div className="space-y-4">
                    {order.messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender === 'client' 
                              ? 'bg-indigo-100 text-indigo-900' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="text-sm">{msg.content}</div>
                          <div className="text-xs text-right mt-1 opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">Aucun message</h3>
                    <p className="text-gray-500">Commencez à échanger avec le vendeur en envoyant un message.</p>
                  </div>
                )}
              </div>
              
              {/* Input pour envoyer un message */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-grow border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiSend className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: Ne partagez pas de coordonnées personnelles (email, téléphone, WhatsApp, etc.)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default OrderDetailPage; 