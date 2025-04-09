import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import OrderDetails from '../../../components/dashboard/OrderDetails';
import { Order, OrderStatus } from '../../../types';
import { FiChevronRight, FiCalendar, FiClock, FiMessageSquare, FiUser, FiAlertCircle } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';

// Définir le type OrderWithExtras pour correspondre à celui attendu par le composant OrderDetails
interface OrderWithExtras extends Order {
  deliveryValidationDeadline?: string;
  deliverables?: Array<{
    id: string;
    name: string;
    url: string;
    createdAt: string;
  }>;
  dispute?: {
    id: string;
    status: string;
    reason?: string;
    createdAt: string;
  };
}

// Simuler des données pour le développement
const MOCK_ORDER: OrderWithExtras = {
  id: 'order-1',
  title: 'Conception de logo pour restaurant',
  serviceId: 'service-1',
  serviceName: 'Conception de logo professionnel',
  providerId: 'provider-1',
  providerName: 'Amadou Diop',
  clientId: 'client-1',
  orderDate: '2023-05-10',
  client: {
    id: 'client-1',
    name: 'Fatou Diallo',
    email: 'fatou.diallo@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    createdAt: '2023-01-15'
  },
  service: {
    id: 'service-1',
    title: 'Conception de logo professionnel',
    description: 'Je vais concevoir un logo professionnel et moderne pour votre entreprise',
    price: 25000,
    rating: 4.9,
    totalReviews: 124,
    deliveryTime: 3,
    revisions: 2,
    images: ['https://via.placeholder.com/300'],
    tags: ['logo', 'design', 'branding'],
    createdAt: '2023-01-01',
    isActive: true
  },
  status: 'completed',
  price: 25000,
  createdAt: '2023-05-15',
  deadline: '2023-05-18',
  isPaid: true,
  messages: [],
  requirements: 'Je voudrais un logo moderne et minimaliste pour mon restaurant de cuisine traditionnelle sénégalaise.',
  deliveryValidationDeadline: '2023-05-20',
  deliverables: [
    {
      id: 'del-1',
      name: 'Logo au format PNG',
      url: 'https://via.placeholder.com/300',
      createdAt: '2023-05-16'
    },
    {
      id: 'del-2',
      name: 'Logo au format SVG',
      url: 'https://via.placeholder.com/300',
      createdAt: '2023-05-16' 
    }
  ],
  dispute: {
    id: 'dispute-1',
    status: 'ouvert',
    reason: 'Livraison non conforme aux exigences',
    createdAt: '2023-05-19'
  }
};

const OrderDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithExtras | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(true); // À définir dynamiquement en fonction de l'utilisateur

  useEffect(() => {
    // Simuler le chargement des données
    const fetchOrder = async () => {
      try {
        // En production, vous remplaceriez ceci par un vrai appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrder(MOCK_ORDER);
        
        // Déterminer si l'utilisateur est le vendeur ou le client
        if (user) {
          setIsSeller(user.id === MOCK_ORDER.providerId);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        toast.error('Impossible de charger les détails de la commande');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, user]);

  // Fonction pour formater une date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date inconnue';
    }
  };

  // Gérer le changement de statut de la commande
  const handleStatusChange = (newStatus: OrderStatus) => {
    if (order) {
      setOrder({
        ...order,
        status: newStatus
      });

      // Ici, vous feriez un appel API pour mettre à jour le statut côté serveur
      console.log(`Statut de la commande mis à jour: ${newStatus}`);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Commande introuvable</h3>
            <p className="mt-1 text-sm text-gray-500">
              Cette commande n'existe pas ou vous n'avez pas l'autorisation d'y accéder.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retour aux commandes
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Fil d'Ariane */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <FiChevronRight className="h-4 w-4 text-gray-400" />
                  <Link href="/dashboard/orders" className="ml-1 text-gray-500 hover:text-gray-700 md:ml-2">
                    Mes commandes
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <FiChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="ml-1 text-gray-800 font-medium md:ml-2 truncate max-w-xs">
                    {order.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </motion.div>

        {/* Utiliser le composant OrderDetails avec la gestion de changement de statut */}
        <OrderDetails 
          order={order} 
          isSeller={isSeller}
          onStatusChange={handleStatusChange}
        />

        {/* Métriques importantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations importantes</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Date de création</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <FiClock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Date d'échéance</p>
                  <p className="text-sm text-gray-500">{formatDate(order.deadline)}</p>
                </div>
              </li>
              {order.deliveryValidationDeadline && (
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Date limite d'approbation</p>
                    <p className="text-sm text-gray-500">{formatDate(order.deliveryValidationDeadline)}</p>
                  </div>
                </li>
              )}
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <FiMessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Messages</p>
                  <p className="text-sm text-gray-500">{order.messages} messages</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {isSeller ? 'Client' : 'Vendeur'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isSeller ? order.client.username : order.service.provider?.username}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Section pour suivre les litiges */}
        {order.status === 'litige' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Suivi du litige</h2>
              <p className="text-sm text-gray-500 mb-4">
                Restez informé de l'évolution du litige concernant cette commande.
              </p>
              <button
                onClick={() => {
                  toast.success("Vous recevrez désormais des notifications pour ce litige");
                }}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiAlertCircle className="mr-2 -ml-1 h-5 w-5" />
                Suivre ce litige
              </button>
              {order.dispute && (
                <div className="mt-4">
                  <Link
                    href={`/dashboard/disputes/${order.dispute.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiMessageSquare className="mr-2 -ml-1 h-5 w-5" />
                    Voir les détails du litige
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrderDetailsPage;