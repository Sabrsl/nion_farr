import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { 
  FiTrendingUp, 
  FiShoppingBag, 
  FiClock, 
  FiDollarSign, 
  FiStar, 
  FiArrowRight, 
  FiEye,
  FiBarChart2,
  FiCheck,
  FiAlertCircle,
  FiUserCheck,
  FiMessageSquare,
  FiCalendar,
  FiPlusCircle,
  FiUser,
  FiRefreshCw,
  FiFilter,
  FiActivity,
  FiXCircle,
  FiTrendingDown,
  FiAlertTriangle,
  FiChevronRight
} from 'react-icons/fi/index.js';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { FreelancerStats, Order, Notification } from '../../types';
import { useRouter } from 'next/router';

const Dashboard: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeChartView, setActiveChartView] = useState('views');
  const [timeFilter, setTimeFilter] = useState('30days');
  const router = useRouter();
  
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
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  // Calcul des statistiques clés
  const pendingAmount = useMemo(() => {
    return stats?.earnings.pending || 0;
  }, [stats]);
  
  useEffect(() => {
    // Simuler le chargement des données
    const fetchData = async () => {
      try {
        // En production, ceci serait remplacé par de vraies requêtes API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          earnings: {
            total: 945000,
            pending: 75000,
            withdrawn: 850000,
            available: 20000
          },
          analytics: {
            views: 1258,
            clicks: 342,
            conversionRate: 5.8,
            averageRating: 4.9,
            completionRate: 98,
            totalOrders: 42,
            pendingOrders: 3,
            totalEarnings: 945000,
            totalReviews: 124
          },
          activeOrders: 3,
          pendingReviews: 2,
          responseRate: 97,
          responseTime: '2 heures'
        });
        
        setRecentOrders([
          {
            id: 'ORD-1234',
            title: 'Conception de logo pour restaurant',
            serviceId: 'SRV-001',
            serviceName: 'Création de logo professionnel',
            providerId: 'PRV-001',
            providerName: 'Amadou Diop',
            clientId: 'CLI-001',
            orderDate: '2023-08-15',
            client: {
              id: 'CLI-001',
              username: 'Fatou Diallo',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
              isVerified: true
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
            status: 'in_progress',
            price: 25000,
            createdAt: '2023-08-15',
            deadline: '2023-08-18',
            isPaid: true,
            messages: [],
            requirements: 'Création d\'un logo moderne pour restaurant'
          },
          {
            id: 'ORD-1235',
            title: 'Développement d\'une landing page',
            serviceId: 'SRV-002',
            serviceName: 'Création de landing page attractive',
            providerId: 'PRV-002',
            providerName: 'Modou Ndiaye',
            clientId: 'CLI-001',
            orderDate: '2023-08-14',
            client: {
              id: 'CLI-002',
              username: 'Modou Ndiaye',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              isVerified: true
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
              slug: 'landing-page-optimisee'
            },
            status: 'pending',
            price: 75000,
            createdAt: '2023-08-14',
            deadline: '2023-08-19',
            isPaid: true,
            messages: [],
            requirements: 'Création d\'une landing page responsive avec formulaire de contact'
          },
          {
            id: 'ORD-1232',
            title: 'Rédaction d\'articles SEO (x5)',
            serviceId: 'SRV-003',
            serviceName: 'Rédaction d\'articles SEO de qualité',
            providerId: 'PRV-003',
            providerName: 'Aminata Sow',
            clientId: 'CLI-001',
            orderDate: '2023-08-13',
            client: {
              id: 'CLI-003',
              username: 'Aminata Sow',
              avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
              isVerified: false
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
              slug: 'articles-seo'
            },
            status: 'in_progress',
            price: 75000,
            createdAt: '2023-08-13',
            deadline: '2023-08-17',
            isPaid: true,
            messages: [],
            requirements: 'Rédaction de 5 articles SEO optimisés avec recherche de mots-clés'
          },
          {
            id: 'ORD-1233',
            title: 'Création d\'un flyer promotionnel pour un événement',
            serviceId: 'SRV-004',
            serviceName: 'Conception de flyers professionnels',
            providerId: 'PRV-004',
            providerName: 'Omar Sall',
            clientId: 'CLI-004',
            orderDate: '2023-08-10',
            client: {
              id: 'CLI-004',
              username: 'Mariama Diallo',
              avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
              isVerified: true
            },
            service: {
              id: 'SRV-004',
              title: 'Je vais créer un flyer promotionnel pour un événement',
              price: 50000,
              rating: 4.7,
              totalReviews: 34,
              deliveryTime: 7,
              images: [],
              orderCount: 78,
              createdAt: '2023-07-15',
              slug: 'flyer-promotionnel'
            },
            status: 'completed',
            price: 50000,
            createdAt: '2023-08-10',
            deadline: '2023-08-17',
            isPaid: true,
            messages: [],
            requirements: 'Création d\'un flyer promotionnel pour un événement'
          }
        ]);
        
        setNotifications([
          {
            id: 'NOTIF-001',
            userId: 'USR-001',
            type: 'order',
            title: 'Nouvelle commande reçue',
            message: 'Nouvelle commande reçue',
            content: 'Vous avez reçu une nouvelle commande pour "Conception de logo"',
            createdAt: '2023-08-15T10:30:00',
            isRead: false,
            link: '/dashboard/orders/ORD-1234'
          },
          {
            id: 'NOTIF-002',
            userId: 'USR-001',
            type: 'message',
            title: 'Nouveau message de Fatou Diallo',
            message: 'Nouveau message reçu',
            content: 'Bonjour, je voudrais savoir si vous pouvez ajouter une révision supplémentaire...',
            createdAt: '2023-08-15T08:45:00',
            isRead: true,
            link: '/dashboard/messages/MSG-567'
          },
          {
            id: 'NOTIF-003',
            userId: 'USR-001',
            type: 'system',
            title: 'Paiement reçu',
            message: 'Paiement reçu pour commande',
            content: '25 000 FCFA ont été ajoutés à votre solde pour la commande #ORD-1230',
            createdAt: '2023-08-14T15:20:00',
            isRead: true,
            link: '/dashboard/earnings'
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Squelette de chargement
  if (isLoading) {
    return (
      <DashboardLayout title="Tableau de bord | NionFar.sn">
        <div className="p-6 sm:p-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-5 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
              ))}
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/4 my-6"></div>
            <div className="bg-gray-200 h-64 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-gray-200 h-72 rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fonction pour rendre le badge de statut
  const renderStatusBadge = (status: string) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    let statusText = "Inconnu";
    
    switch(status) {
      case 'completed':
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        statusText = "Terminée";
        break;
      case 'in_progress':
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        statusText = "En cours";
        break;
      case 'pending':
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        statusText = "En attente";
        break;
      case 'cancelled':
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        statusText = "Annulée";
        break;
      case 'revision':
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        statusText = "Révision";
        break;
    }
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {statusText}
      </span>
    );
  };

  // Fonction pour rendre le badge de notification
  const renderNotificationIcon = (type: string) => {
    switch(type) {
      case 'order':
        return <div className="bg-blue-100 text-blue-600 h-10 w-10 rounded-full flex items-center justify-center"><FiShoppingBag className="h-5 w-5" /></div>;
      case 'message':
        return <div className="bg-green-100 text-green-600 h-10 w-10 rounded-full flex items-center justify-center"><FiMessageSquare className="h-5 w-5" /></div>;
      case 'system':
        return <div className="bg-yellow-100 text-yellow-600 h-10 w-10 rounded-full flex items-center justify-center"><FiAlertCircle className="h-5 w-5" /></div>;
      case 'payment':
        return <div className="bg-purple-100 text-purple-600 h-10 w-10 rounded-full flex items-center justify-center"><FiDollarSign className="h-5 w-5" /></div>;
      default:
        return <div className="bg-gray-100 text-gray-600 h-10 w-10 rounded-full flex items-center justify-center"><FiAlertCircle className="h-5 w-5" /></div>;
    }
  };

  return (
    <DashboardLayout title="Tableau de bord | NionFar.sn">
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 max-w-[1600px] mx-auto">
        {/* En-tête avec date et bouton de rafraîchissement */}
        <div className="flex items-center justify-between mb-6 mt-4 sm:mt-6 lg:mt-8">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
              <FiClock className="text-gray-400" />
              <span className="text-gray-700">{formattedDate}</span>
            </div>
            <button onClick={() => setIsLoading(true)} className="flex items-center space-x-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
              <FiRefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Statistiques principales - Grille responsive avec cartes d'indicateurs clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Carte Commandes en cours */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">En cours</span>
              <div className="bg-blue-100 p-2 rounded-full">
                <FiShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.activeOrders || 0}</h3>
                <p className="text-sm text-gray-500 mt-1">Commandes actives</p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium px-2 py-1 bg-green-50 rounded-lg">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                <span>33%</span>
              </div>
            </div>
          </div>

          {/* Carte Litiges */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/disputes')}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Litiges</span>
              <div className="bg-amber-100 p-2 rounded-full">
                <FiAlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">2</h3>
                <p className="text-sm text-gray-500 mt-1">Litiges en cours</p>
              </div>
              <Link href="/dashboard/disputes" className="flex items-center text-indigo-600 text-sm font-medium px-2 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                <span>Voir</span>
                <FiChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Carte Revenus */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Revenus</span>
              <div className="bg-green-100 p-2 rounded-full">
                <FiDollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.earnings.total || 0)}</h3>
                <p className="text-sm text-gray-500 mt-1">Total des revenus</p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium px-2 py-1 bg-green-50 rounded-lg">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                <span>17%</span>
              </div>
            </div>
          </div>

          {/* Carte Évaluation */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Évaluation</span>
              <div className="bg-yellow-100 p-2 rounded-full">
                <FiStar className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.analytics.averageRating || 0}/5</h3>
                <p className="text-sm text-gray-500 mt-1">{stats?.analytics.totalReviews || 0} avis</p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium px-2 py-1 bg-green-50 rounded-lg">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                <span>4%</span>
              </div>
            </div>
          </div>

          {/* Carte Temps de réponse */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Réponse</span>
              <div className="bg-purple-100 p-2 rounded-full">
                <FiClock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.responseTime || '0h'}</h3>
                <p className="text-sm text-gray-500 mt-1">Temps moyen de réponse</p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium px-2 py-1 bg-green-50 rounded-lg">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                <span>8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique des performances avec filtres améliorés */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Performances</h2>
            <div className="flex items-center space-x-2">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-sm border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8 bg-white shadow-sm"
              >
                <option value="30days">30 derniers jours</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              <button className="flex items-center text-sm border border-gray-300 rounded-lg text-gray-700 px-3 py-2 bg-white shadow-sm hover:bg-gray-50">
                <FiFilter className="mr-2 h-4 w-4" />
                Filtrer
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                <button 
                  onClick={() => setActiveChartView('views')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeChartView === 'views' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Vues
                </button>
                <button
                  onClick={() => setActiveChartView('orders')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeChartView === 'orders' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Commandes
                </button>
                <button
                  onClick={() => setActiveChartView('revenue')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeChartView === 'revenue' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Revenus
                </button>
              </div>
              <div className="flex items-center text-gray-600 text-sm bg-indigo-50 px-3 py-1.5 rounded-lg">
                <FiEye className="h-4 w-4 mr-2 text-indigo-600" />
                <span><b>{stats?.analytics.views || 0}</b> vues ce mois</span>
              </div>
            </div>

            <div className="h-64 sm:h-72 lg:h-80 w-full relative">
              {/* Ici, on afficherait normalement un graphique avec une bibliothèque comme Chart.js ou ReChart */}
              <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                <FiBarChart2 className="h-12 w-12 mb-3 text-indigo-300" />
                <p className="text-base font-medium text-gray-600 mb-1">Graphique des performances</p>
                <p className="text-xs text-gray-500">(Intégrez une bibliothèque de graphiques en production)</p>
              </div>
              
              {/* Superposition d'exemple pour montrer l'apparence du graphique */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="h-full w-full bg-[url('/img/chart-example.svg')] bg-no-repeat bg-contain bg-center"></div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Taux de conversion</p>
                  <div className="flex items-center text-green-600 text-xs font-medium">
                    <FiTrendingUp className="h-3 w-3 mr-1" />
                    <span>+2.1%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.analytics.conversionRate || 0}%</p>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
                  <div className="h-1 bg-green-500 rounded-full" style={{width: `${stats?.analytics.conversionRate || 0}%`}}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Taux de complétion</p>
                  <div className="flex items-center text-green-600 text-xs font-medium">
                    <FiTrendingUp className="h-3 w-3 mr-1" />
                    <span>+5.3%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.analytics.completionRate || 0}%</p>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
                  <div className="h-1 bg-green-500 rounded-full" style={{width: `${stats?.analytics.completionRate || 0}%`}}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Commandes totales</p>
                  <div className="flex items-center text-green-600 text-xs font-medium">
                    <FiTrendingUp className="h-3 w-3 mr-1" />
                    <span>+12.8%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.analytics.totalOrders || 0}</p>
                <p className="text-xs text-gray-500 mt-2">{stats?.analytics.pendingOrders || 0} commandes en attente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commandes récentes et Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Commandes récentes - 2/3 colonnes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Commandes récentes</h2>
              <Link href="/dashboard/orders" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                Voir toutes <FiArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[180px]">{order.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                              {order.client.avatar ? (
                                <img 
                                  src={order.client.avatar} 
                                  alt={order.client.username}
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
                                {order.client.username}
                                {order.client.isVerified && (
                                  <FiCheck className="ml-1 h-3 w-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{formatCurrency(order.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(order.status)}
                          {order.messages && (typeof order.messages === 'number' ? order.messages > 0 : order.messages.length > 0) && (
                            <div className="mt-1 flex items-center text-xs text-indigo-600">
                              <FiMessageSquare className="h-3 w-3 mr-1" />
                              {typeof order.messages === 'number' 
                                ? `${order.messages} ${order.messages > 1 ? 'messages' : 'message'}`
                                : `${order.messages.length} ${order.messages.length > 1 ? 'messages' : 'message'}`
                              }
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {order.deadline}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/dashboard/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                            Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {recentOrders.length === 0 && (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <FiShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune commande récente</h3>
                  <p className="text-gray-500">Les commandes que vous recevez apparaîtront ici</p>
                </div>
              )}
            </div>

            {/* Bouton Créer un service - Style amélioré */}
            <div>
              <Link 
                href="/dashboard/services/new" 
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center group"
              >
                <div className="flex items-center justify-center">
                  <div className="mr-3 p-1.5 bg-white/20 rounded-full">
                    <FiPlusCircle className="h-5 w-5" />
                  </div>
                  <span className="text-lg">Créer un nouveau service</span>
                  <FiArrowRight className="ml-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            </div>
          </div>

          {/* Notifications et statistiques complémentaires - 1/3 colonnes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <Link href="/dashboard/notifications" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                Tout voir <FiArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Link 
                    key={notification.id}
                    href={notification.link || '#'} 
                    className={`block p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-indigo-50/70' : ''}`}
                  >
                    <div className="flex">
                      {renderNotificationIcon(notification.type)}
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{notification.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        })}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 self-center">
                          <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <FiMessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune notification</h3>
                  <p className="text-gray-500">Vous serez informé des nouvelles activités</p>
                </div>
              )}
            </div>

            {/* Widget de solde disponible */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-6">Solde disponible</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold mb-1">{formatCurrency(stats?.earnings.available || 0)}</p>
                  <p className="text-sm text-indigo-200">{formatCurrency(pendingAmount)} en attente</p>
                </div>
                <Link 
                  href="/dashboard/earnings"
                  className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm"
                >
                  Retirer
                </Link>
              </div>
              <div className="mt-6 pt-5 border-t border-white/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-100">Dernier retrait</span>
                  <span className="font-medium">21 juillet 2023</span>
                </div>
              </div>
            </div>

            {/* Statistiques complémentaires - Version améliorée */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-5">Statistiques de performance</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 mr-3">
                        <FiUserCheck className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-600">Taux de réponse</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats?.responseRate || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${stats?.responseRate || 0}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-1.5 rounded-md text-green-600 mr-3">
                        <FiCheck className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-600">Taux de complétion</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats?.analytics.completionRate || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${stats?.analytics.completionRate || 0}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-1.5 rounded-md text-yellow-600 mr-3">
                        <FiClock className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-600">Avis en attente</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats?.pendingReviews || 0}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-yellow-500 rounded-full" style={{ width: `${Math.min((stats?.pendingReviews || 0) * 20, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-1.5 rounded-md text-purple-600 mr-3">
                        <FiActivity className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-600">Niveau du vendeur</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Niveau 2</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `70%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;