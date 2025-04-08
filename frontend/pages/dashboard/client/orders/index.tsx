import { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';
import { 
  FiFilter, 
  FiEye, 
  FiCalendar, 
  FiSearch, 
  FiCheck, 
  FiClock, 
  FiAlertTriangle, 
  FiRefreshCw, 
  FiChevronDown,
  FiUser
} from 'react-icons/fi';
import ClientDashboardLayout from '../../../../components/dashboard/ClientDashboardLayout';
import Link from 'next/link';
import { Order, OrderStatus, User } from '../../../../types';

// Extended Order interface for our component needs
interface ExtendedOrder extends Order {
  seller: User;
  deliveryValidationDeadline?: string;
  clientId: string;
}

const ClientOrdersPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' FCFA';
  };

  // Formater la date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Commandes fictives
      setOrders([
        {
          id: 'ORD-1234',
          title: 'Conception de logo pour restaurant',
          serviceId: 'SRV-001',
          serviceName: 'Création de logo professionnel',
          providerId: 'SEL-001',
          providerName: 'Amadou Diop',
          clientId: 'CLI-001',
          client: {
            id: 'CLI-001',
            name: 'Fatou Diallo',
            username: 'Fatou Diallo',
            email: 'fatou.diallo@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isVerified: true,
            createdAt: '2023-01-15',
            role: 'client'
          },
          seller: {
            id: 'SEL-001',
            name: 'Amadou Diop',
            username: 'Amadou Diop',
            email: 'amadou.diop@example.com',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            isVerified: true,
            createdAt: '2022-10-05',
            role: 'provider'
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
            slug: 'logo-professionnel',
            isActive: true
          },
          status: 'livré',
          price: 25000,
          createdAt: '2023-08-15',
          deadline: '2023-08-18',
          orderDate: '2023-08-15',
          expectedDeliveryDate: '2023-08-18',
          isPaid: true,
          messages: [],
          requirements: 'Création d\'un logo moderne pour restaurant',
          deliveryValidationDeadline: '2023-08-21'
        },
        {
          id: 'ORD-1235',
          title: 'Développement d\'une landing page',
          serviceId: 'SRV-002',
          serviceName: 'Création d\'une landing page attractive',
          providerId: 'SEL-002',
          providerName: 'Modou Ndiaye',
          clientId: 'CLI-001',
          client: {
            id: 'CLI-001',
            name: 'Fatou Diallo',
            username: 'Fatou Diallo',
            email: 'fatou.diallo@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isVerified: true,
            createdAt: '2023-01-15',
            role: 'client'
          },
          seller: {
            id: 'SEL-002',
            name: 'Modou Ndiaye',
            username: 'Modou Ndiaye',
            email: 'modou.ndiaye@example.com',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            isVerified: true,
            createdAt: '2022-09-12',
            role: 'provider'
          },
          service: {
            id: 'SRV-002',
            title: 'Je vais créer une landing page attractive et optimisée',
            price: 75000,
            rating: 4.8,
            totalReviews: 87,
            deliveryTime: 5,
            images: [],
            orderCount: 156,
            createdAt: '2023-04-24',
            slug: 'landing-page-optimisee',
            isActive: true
          },
          status: 'en_cours',
          price: 75000,
          createdAt: '2023-08-14',
          deadline: '2023-08-19',
          orderDate: '2023-08-14',
          expectedDeliveryDate: '2023-08-19',
          isPaid: true,
          messages: [],
          requirements: 'Création d\'une landing page responsive avec formulaire de contact'
        },
        {
          id: 'ORD-1232',
          title: 'Rédaction d\'articles SEO (x5)',
          serviceId: 'SRV-003',
          serviceName: 'Rédaction d\'articles SEO de qualité',
          providerId: 'SEL-003',
          providerName: 'Aminata Sow',
          clientId: 'CLI-001',
          client: {
            id: 'CLI-001',
            name: 'Fatou Diallo',
            username: 'Fatou Diallo',
            email: 'fatou.diallo@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isVerified: true,
            createdAt: '2023-01-15',
            role: 'client'
          },
          seller: {
            id: 'SEL-003',
            name: 'Aminata Sow',
            username: 'Aminata Sow',
            email: 'aminata.sow@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            isVerified: false,
            createdAt: '2022-11-20',
            role: 'provider'
          },
          service: {
            id: 'SRV-003',
            title: 'Je vais rédiger des articles SEO de qualité pour votre blog',
            price: 15000,
            rating: 5.0,
            totalReviews: 53,
            deliveryTime: 2,
            images: [],
            orderCount: 112,
            createdAt: '2023-06-08',
            slug: 'articles-seo',
            isActive: true
          },
          status: 'terminée',
          price: 75000,
          createdAt: '2023-08-13',
          deadline: '2023-08-17',
          orderDate: '2023-08-13',
          expectedDeliveryDate: '2023-08-17',
          isPaid: true,
          messages: [],
          requirements: 'Rédaction de 5 articles SEO optimisés avec recherche de mots-clés'
        },
        {
          id: 'ORD-1230',
          title: 'Conception de flyer promotionnel',
          serviceId: 'SRV-004',
          serviceName: 'Conception de flyers professionnels',
          providerId: 'SEL-004',
          providerName: 'Omar Sall',
          clientId: 'CLI-001',
          client: {
            id: 'CLI-001',
            name: 'Fatou Diallo',
            username: 'Fatou Diallo',
            email: 'fatou.diallo@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isVerified: true,
            createdAt: '2023-01-15',
            role: 'client'
          },
          seller: {
            id: 'SEL-004',
            name: 'Omar Sall',
            username: 'Omar Sall',
            email: 'omar.sall@example.com',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            isVerified: true,
            createdAt: '2022-08-10',
            role: 'provider'
          },
          service: {
            id: 'SRV-004',
            title: 'Je vais concevoir des flyers et brochures professionnels',
            price: 30000,
            rating: 4.7,
            totalReviews: 89,
            deliveryTime: 2,
            images: [],
            orderCount: 178,
            createdAt: '2023-07-10',
            slug: 'flyers-professionnels',
            isActive: true
          },
          status: 'litige',
          price: 30000,
          createdAt: '2023-08-10',
          deadline: '2023-08-12',
          orderDate: '2023-08-10',
          expectedDeliveryDate: '2023-08-12',
          isPaid: true,
          messages: [],
          requirements: 'Création d\'un flyer promotionnel pour un événement'
        },
        {
          id: 'ORD-1228',
          title: 'Traduction de document français-anglais',
          serviceId: 'SRV-005',
          serviceName: 'Traduction français-anglais',
          providerId: 'SEL-005',
          providerName: 'Aïda Kane',
          clientId: 'CLI-001',
          client: {
            id: 'CLI-001',
            name: 'Fatou Diallo',
            username: 'Fatou Diallo',
            email: 'fatou.diallo@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isVerified: true,
            createdAt: '2023-01-15',
            role: 'client'
          },
          seller: {
            id: 'SEL-005',
            name: 'Aïda Kane',
            username: 'Aïda Kane',
            email: 'aida.kane@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
            isVerified: true,
            createdAt: '2022-07-05',
            role: 'provider'
          },
          service: {
            id: 'SRV-005',
            title: 'Je vais traduire vos documents du français vers l\'anglais',
            price: 20000,
            rating: 4.9,
            totalReviews: 115,
            deliveryTime: 1,
            images: [],
            orderCount: 203,
            createdAt: '2023-06-15',
            slug: 'traduction-francais-anglais',
            isActive: true
          },
          status: 'terminée',
          price: 20000,
          createdAt: '2023-08-08',
          deadline: '2023-08-09',
          orderDate: '2023-08-06',
          expectedDeliveryDate: '2023-08-09',
          isPaid: true,
          messages: [],
          requirements: 'Traduction d\'un document de 10 pages du français vers l\'anglais'
        }
      ]);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Filtrer et trier les commandes
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Appliquer le filtre de statut
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Appliquer le filtre de période
    if (periodFilter === 'last-month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      result = result.filter(order => order.createdAt && new Date(order.createdAt) >= oneMonthAgo);
    } else if (periodFilter === 'last-3-months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      result = result.filter(order => order.createdAt && new Date(order.createdAt) >= threeMonthsAgo);
    }

    // Appliquer la recherche
    if (searchQuery.trim() !== '') {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(order => {
        return (
          order.id.toLowerCase().includes(searchLower) ||
          (order.title ? order.title.toLowerCase().includes(searchLower) : false) ||
          (order.seller.username ? order.seller.username.toLowerCase().includes(searchLower) : false) ||
          (order.service.title ? order.service.title.toLowerCase().includes(searchLower) : false)
        );
      });
    }

    // Appliquer le tri
    if (sortBy === 'date-desc') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [orders, statusFilter, periodFilter, searchQuery, sortBy]);

  return (
    <ClientDashboardLayout title="Mes Commandes | NionFar.sn">
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6 mt-4 sm:mt-6 lg:mt-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
              <FiCalendar className="text-gray-400" />
              <span className="text-gray-700">
                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button 
              onClick={() => setIsLoading(true)} 
              className="flex items-center space-x-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une commande..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <div className="w-full sm:w-auto">
                <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="in_progress">En cours</option>
                  <option value="delivered">Livrées</option>
                  <option value="completed">Terminées</option>
                  <option value="disputes">Litiges</option>
                </select>
              </div>
              
              <div className="w-full sm:w-auto">
                <label htmlFor="period-filter" className="block text-xs font-medium text-gray-700 mb-1">
                  Période
                </label>
                <select
                  id="period-filter"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="last-month">Dernier mois</option>
                  <option value="last-3-months">3 derniers mois</option>
                </select>
              </div>
              
              <div className="w-full sm:w-auto">
                <label htmlFor="sort-by" className="block text-xs font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="date-desc">Date (récent)</option>
                  <option value="date-asc">Date (ancien)</option>
                  <option value="price-desc">Prix (décroissant)</option>
                  <option value="price-asc">Prix (croissant)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin mb-4"></div>
                <p className="text-gray-600">Chargement des commandes...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune commande trouvée</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1">{order.service.title || 'Commande sans titre'}</div>
                            <div className="text-xs text-gray-500">ID: {order.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                            {order.seller.avatar ? (
                              <img 
                                src={order.seller.avatar} 
                                alt={order.seller.username || ''}
                                className="h-8 w-8 object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-600">
                                <FiUser className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {order.seller.username}
                              {order.seller.isVerified && (
                                <FiCheck className="ml-1 h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/dashboard/client/orders/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center text-sm font-medium"
                        >
                          <FiEye className="mr-1 h-4 w-4" />
                          Voir détails
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
    </ClientDashboardLayout>
  );
};

export default ClientOrdersPage; 