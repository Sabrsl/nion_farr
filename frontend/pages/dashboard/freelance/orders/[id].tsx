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
  FiUser,
  FiPackage,
  FiFileText,
  FiSend,
  FiUpload
} from 'react-icons/fi';
import FreelanceDashboardLayout from '../../../../components/dashboard/FreelanceDashboardLayout';
import Link from 'next/link';
import { Order } from '../../../../types';
import RoleGuard from '../../../../components/auth/RoleGuard';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Interface étendue pour inclure les propriétés supplémentaires
interface ExtendedOrder extends Order {
  seller?: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
  };
  deliveryValidationDeadline?: string;
}

const FreelanceOrderDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [isDelivering, setIsDelivering] = useState(false);
  const { user } = useAuth();

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString() + ' FCFA';
  };
  
  // Formater les dates
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  useEffect(() => {
    if (!id) return;

    console.log('Loading order details for ID:', id);
    
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      try {
        // Commande fictive pour démonstration
        setOrder({
          id: id as string,
          title: 'Conception de logo pour restaurant',
          serviceId: 'SRV-001',
          serviceName: 'Je vais créer un logo professionnel pour votre entreprise',
          providerId: user?.id || 'SEL-001', // Utiliser l'ID de l'utilisateur connecté si disponible
          providerName: user?.name || 'Amadou Diop',
          clientId: 'CLI-001',
          orderDate: '2023-08-15',
          client: {
            id: 'CLI-001',
            name: 'Fatou Diallo',
            username: 'Fatou Diallo',
            email: 'fatou.diallo@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isVerified: true,
            createdAt: '2023-01-15'
          },
          seller: {
            id: user?.id || 'SEL-001',
            name: user?.name || 'Amadou Diop',
            username: user?.name || 'Amadou Diop',
            email: user?.email || 'amadou.diop@example.com',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            isVerified: true,
            createdAt: '2022-10-05'
          },
          service: {
            id: 'SRV-001',
            title: 'Je vais créer un logo professionnel pour votre entreprise',
            price: 25000,
            rating: 4.9,
            totalReviews: 124,
            deliveryTime: 3,
            images: [],
            orderCount: 243,
            createdAt: '2023-05-12',
            slug: 'logo-professionnel'
          },
          status: 'en_cours',
          price: 25000,
          createdAt: '2023-08-15',
          deadline: '2023-08-18',
          isPaid: true,
          messages: [
            {
              id: 'MSG-001',
              sender: 'client',
              content: 'Bonjour, je souhaite un logo moderne pour mon restaurant.',
              createdAt: '2023-08-15T10:30:00',
              isRead: true
            },
            {
              id: 'MSG-002',
              sender: 'seller',
              content: 'Bonjour, merci pour votre commande. Je vais travailler sur votre logo dès aujourd\'hui.',
              createdAt: '2023-08-15T11:15:00',
              isRead: true
            }
          ],
          requirements: 'Création d\'un logo moderne pour restaurant avec des couleurs chaudes (orange, rouge). Style épuré et minimaliste. Format vectoriel et PNG transparent. Trois propositions différentes.',
          deliveryValidationDeadline: '2023-08-21',
          deliverables: []
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement de la commande:', err);
        setIsLoading(false);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id, user]);

  // Vérifier si la commande peut être livrée
  const canDeliver = order?.status === 'en_cours';
  
  // Vérifier si la commande est terminée
  const isCompleted = order?.status === 'terminée' || order?.status === 'terminé';

  // Gérer l'envoi d'un message
  const handleSendMessage = () => {
    if (!message.trim() || !order) return;
    
    // Simuler l'envoi d'un message
    toast.success('Message envoyé avec succès');
    setMessage('');
  };

  // Gérer la livraison
  const handleDelivery = () => {
    if (!canDeliver) return;
    
    setIsDelivering(true);
    
    // Simuler la livraison
    setTimeout(() => {
      setOrder(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'livré',
          deliverables: [
            ...prev.deliverables || [],
            {
              id: `DEL-${Date.now()}`,
              name: 'Logo final',
              url: 'https://example.com/files/logo_final.zip',
              orderId: id as string,
              message: 'Voici le logo final comme convenu. Merci de me faire part de vos retours.',
              fileUrls: ['https://example.com/files/logo_final.zip'],
              createdAt: new Date().toISOString()
            }
          ]
        };
      });
      
      toast.success('Livraison effectuée avec succès');
      setIsDelivering(false);
    }, 2000);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin mb-4"></div>
              <p className="text-gray-600">Chargement des détails de la commande...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Commande introuvable</h3>
            <p className="text-gray-500 mb-4">La commande que vous recherchez n'existe pas ou vous n'y avez pas accès.</p>
            <Link 
              href="/dashboard/freelance/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Retour à mes commandes
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <Link 
            href="/dashboard/freelance/orders"
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
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status === 'en_cours' ? 'En cours' : 
                   order.status === 'livré' ? 'Livré' : 
                   order.status === 'terminée' || order.status === 'terminé' ? 'Terminé' :
                   order.status}
                </span>
              </div>
              <p className="text-gray-500 mt-1">ID: {order.id}</p>
            </div>
            
            {/* Actions de livraison */}
            {canDeliver && (
              <div className="mt-4 md:mt-0">
                <button
                  onClick={handleDelivery}
                  disabled={isDelivering}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDelivering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin mr-2"></div>
                      Livraison en cours...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2 h-4 w-4" />
                      Livrer la commande
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Badge de commande terminée */}
            {isCompleted && (
              <div className="mt-4 md:mt-0">
                <span className="inline-flex items-center px-4 py-2 border border-green-200 text-sm font-medium rounded-md text-green-800 bg-green-50">
                  <FiCheck className="mr-2 h-4 w-4" />
                  Commande terminée
                </span>
              </div>
            )}
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
                  <span className="font-medium">Date de commande:</span> {order.createdAt ? formatDate(order.createdAt) : 'Date non disponible'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Livraison prévue:</span> {order.deadline ? formatDate(order.deadline) : 'Date non disponible'}
                </p>
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
                <span className="text-sm font-medium text-gray-700">Client</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  {order.client?.avatar ? (
                    <img 
                      src={order.client.avatar} 
                      alt={order.client.name}
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 text-indigo-600">
                      <FiUser className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    {order.client?.name}
                    {order.client?.isVerified && (
                      <FiCheck className="ml-1 h-3 w-3 text-green-500" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description de la commande */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
            {order.messages && order.messages.length > 0 ? (
              <div className="space-y-4">
                {order.messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === 'seller' ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-right mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FiMessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">Aucun message pour le moment</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none"
            >
              <FiSend className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={['provider']}>
      <FreelanceDashboardLayout title={`Commande ${id} | NionFar.sn`}>
        {renderContent()}
      </FreelanceDashboardLayout>
    </RoleGuard>
  );
};

export default FreelanceOrderDetailPage; 