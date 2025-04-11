import { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';
import { 
  FiShoppingBag, 
  FiClock, 
  FiDollarSign, 
  FiStar, 
  FiArrowRight, 
  FiEye,
  FiCheck,
  FiAlertCircle,
  FiMessageSquare,
  FiCalendar,
  FiFilter,
  FiHeart,
  FiRefreshCw,
  FiShoppingCart,
  FiUser
} from 'react-icons/fi/index.js';
import ClientDashboardLayout from '../../../components/dashboard/ClientDashboardLayout';
import Link from 'next/link';
import { Order } from '../../../types';

interface ClientStats {
  totalSpent: number;
  ordersCount: number;
  activeOrders: number;
  completedOrders: number;
}

interface ClientOrder {
  id: string;
  title: string;
  price: number;
  status: 'livré' | 'en_cours' | 'en_attente' | 'litige';
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  createdAt: string;
}

const ClientDashboard: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [favoriteServices, setFavoriteServices] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' FCFA';
  };
  
  // Date formatée pour l'affichage
  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setStats({
        totalSpent: 325000,
        ordersCount: 7,
        activeOrders: 2,
        completedOrders: 4
      });

      setOrders([
        {
          id: 'ORD-1234',
          title: 'Conception de logo pour restaurant',
          price: 25000,
          status: 'livré',
          seller: {
            id: 'SELL-001',
            name: 'Amadou Diop',
            avatar: ''
          },
          dueDate: '2023-08-18',
          createdAt: '2023-08-14'
        },
        {
          id: 'ORD-1235',
          title: 'Développement d\'une landing page',
          price: 75000,
          status: 'en_cours',
          seller: {
            id: 'SELL-002',
            name: 'Moussa Faye',
            avatar: ''
          },
          dueDate: '2023-08-25',
          createdAt: '2023-08-10'
        },
        {
          id: 'ORD-1236',
          title: 'Rédaction d\'articles blog (5 articles)',
          price: 50000,
          status: 'en_cours',
          seller: {
            id: 'SELL-003',
            name: 'Aïda Sow',
            avatar: ''
          },
          dueDate: '2023-08-22',
          createdAt: '2023-08-08'
        }
      ]);

      // Services favoris fictifs
      setFavoriteServices([
        {
          id: 'SRV-001',
          title: 'Je vais créer un logo professionnel pour votre entreprise',
          price: 25000,
          seller: {
            username: 'Amadou Diop',
            rating: 4.9
          },
          image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Logo+Design'
        },
        {
          id: 'SRV-004',
          title: 'Je vais développer votre site web sur mesure',
          price: 150000,
          seller: {
            username: 'Ibrahim Faye',
            rating: 4.7
          },
          image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Web+Development'
        }
      ]);

      // Recommandations fictives
      setRecommendations([
        {
          id: 'SRV-005',
          title: 'Je vais créer une stratégie de médias sociaux efficace',
          price: 65000,
          seller: {
            username: 'Mariama Bâ',
            rating: 4.8
          },
          image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Social+Media'
        },
        {
          id: 'SRV-006',
          title: 'Je vais optimiser votre site pour le référencement (SEO)',
          price: 85000,
          seller: {
            username: 'Cheikh Diop',
            rating: 4.6
          },
          image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=SEO'
        }
      ]);

      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Filtrer les commandes selon le statut sélectionné
  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    if (activeFilter === 'in_progress') return orders.filter(order => order.status === 'en_cours');
    if (activeFilter === 'completed') return orders.filter(order => order.status === 'livré');
    if (activeFilter === 'disputes') return orders.filter(order => order.status === 'litige');
    return orders;
  }, [orders, activeFilter]);

  // Données simulées pour les suggestions de services
  const suggestedServices = [
    {
      id: '1',
      title: 'Conception de Logo Professionnelle',
      description: 'Obtenez un logo unique et mémorable pour votre entreprise',
      price: 12000,
      image: '/images/service-placeholder.svg'
    },
    {
      id: '2',
      title: 'Développement Site Web Responsive',
      description: 'Un site web moderne optimisé pour tous les appareils',
      price: 45000,
      image: '/images/service-placeholder.svg'
    },
    {
      id: '3',
      title: 'Gestion des Réseaux Sociaux',
      description: 'Augmentez votre présence en ligne avec une stratégie efficace',
      price: 18000,
      image: '/images/service-placeholder.svg'
    },
    {
      id: '4',
      title: 'Optimisation SEO',
      description: 'Améliorez votre classement dans les moteurs de recherche',
      price: 25000,
      image: '/images/service-placeholder.svg'
    },
  ];

  return (
    <ClientDashboardLayout title="Tableau de bord Client | NionFar.sn">
      <div className="h-full flex flex-col">
        <header className="bg-white flex items-center h-16 border-b border-gray-200 px-4">
          <div className="flex flex-col justify-center h-16"> 
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">Bienvenue, Fatou</h1>
            <p className="text-sm text-gray-500 leading-tight">Voici un aperçu de vos commandes et achats.</p>
          </div>
        </header>

        <div className="flex-1 p-4">
          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              // Placeholders de chargement
              <>
                <div className="bg-white rounded-lg shadow p-5 animate-pulse h-32"></div>
                <div className="bg-white rounded-lg shadow p-5 animate-pulse h-32"></div>
                <div className="bg-white rounded-lg shadow p-5 animate-pulse h-32"></div>
                <div className="bg-white rounded-lg shadow p-5 animate-pulse h-32"></div>
              </>
            ) : (
              <>
                {/* Dépenses totales */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FiDollarSign className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Dépenses totales</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats?.totalSpent || 0)}</p>
                  </div>
                </div>
                
                {/* Commandes */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Commandes</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-gray-900">{stats?.ordersCount || 0}</p>
                  </div>
                </div>
                
                {/* En cours */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FiClock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">En cours</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-gray-900">{stats?.activeOrders || 0}</p>
                  </div>
                </div>
                
                {/* Terminées */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Terminées</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-gray-900">{stats?.completedOrders || 0}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tableau des commandes */}
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Mes commandes</h2>
                <div className="flex space-x-4">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full">
                      Toutes
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-full">
                      En cours
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-full">
                      Livrées
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-full">
                      Litiges
                    </button>
                  </div>
                  <Link 
                    href="/dashboard/client/orders" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    Voir tout 
                    <FiArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-4 space-y-4">
                  <div className="animate-pulse h-16 bg-gray-100 rounded"></div>
                  <div className="animate-pulse h-16 bg-gray-100 rounded"></div>
                  <div className="animate-pulse h-16 bg-gray-100 rounded"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          COMMANDE
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          VENDEUR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PRIX
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DATE LIMITE
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STATUT
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{order.id}</div>
                                <div className="text-sm text-gray-500">{order.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {order.seller.avatar ? (
                                <img 
                                  src={order.seller.avatar} 
                                  alt={order.seller.name}
                                  className="h-8 w-8 rounded-full mr-2" 
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                  <FiUser className="h-4 w-4 text-indigo-600" />
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900">{order.seller.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(order.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(order.dueDate).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.status === 'livré' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Livré
                              </span>
                            )}
                            {order.status === 'en_cours' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                En cours
                              </span>
                            )}
                            {order.status === 'en_attente' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                En attente
                              </span>
                            )}
                            {order.status === 'litige' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Litige
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/dashboard/client/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                              Voir
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientDashboard; 