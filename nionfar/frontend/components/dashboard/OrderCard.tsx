import React from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '../../types';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiCheck, 
  FiChevronRight, 
  FiAlertCircle, 
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiGrid,
  FiBell
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { disputeService } from '../../services/disputeService';
import { useAuth } from '../../contexts/AuthContext';

interface OrderCardProps {
  order: Order;
  isSeller?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  isSeller = true 
}) => {
  const { user } = useAuth();

  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Fonction pour déterminer si une commande est en retard
  const isOrderLate = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate && ['en_cours', 'en_attente_acceptation'].includes(order.status);
  };

  // Fonction pour suivre un litige
  const handleFollowDispute = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !order.dispute) {
      toast.error("Impossible de suivre ce litige");
      return;
    }
    
    try {
      toast.info("Abonnement au litige en cours...", { autoClose: 1000 });
      
      const result = await disputeService.followDispute(order.dispute.id, user.id);
      
      if (result.success) {
        toast.success(result.message || "Vous suivez maintenant ce litige");
      } else {
        toast.error(result.message || "Erreur lors de l'abonnement au litige");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Une erreur est survenue");
    }
  };

  // Fonction pour déterminer la couleur et l'icône du statut
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente_acceptation':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <FiClock className="h-5 w-5" />,
          text: 'En attente d\'acceptation'
        };
      case 'en_cours':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <FiClock className="h-5 w-5" />,
          text: 'En cours'
        };
      case 'livré':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <FiCheck className="h-5 w-5" />,
          text: 'Livré'
        };
      case 'en_modification':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: <FiClock className="h-5 w-5" />,
          text: 'En modification'
        };
      case 'terminée':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <FiCheck className="h-5 w-5" />,
          text: 'Terminée'
        };
      case 'annulée':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <FiAlertCircle className="h-5 w-5" />,
          text: 'Annulée'
        };
      case 'litige':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <FiAlertCircle className="h-5 w-5" />,
          text: 'Litige'
        };
      case 'livraison_en_retard':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <FiAlertCircle className="h-5 w-5" />,
          text: 'Livraison en retard'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <FiClock className="h-5 w-5" />,
          text: status
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const isLate = isOrderLate(order.deadline);

  return (
    <Link href={`/dashboard/orders/${order.id}`}>
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
      >
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">{order.title}</h3>
              
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiGrid className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{order.service.title}</span>
                </div>
                
                <div className="flex items-center">
                  <FiCalendar className="mr-1 h-4 w-4 text-gray-400" />
                  <span>Deadline: {formatDate(order.deadline)}</span>
                  {isLate && (
                    <span className="ml-1 text-red-600 font-semibold">
                      (En retard)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <FiDollarSign className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{formatPrice(order.price)}</span>
                </div>
                
                <div className="flex items-center">
                  <FiUser className="mr-1 h-4 w-4 text-gray-400" />
                  <span>
                    {isSeller 
                      ? `Client: ${order.client.name || order.client.username}` 
                      : `Vendeur: ${order.seller?.name || order.seller?.username}`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${statusInfo.color}`}>
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </span>
               
              {order.status === 'litige' && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    onClick={handleFollowDispute}
                    className="px-3 py-1 inline-flex items-center text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  >
                    <FiBell className="mr-1 h-3 w-3" />
                    Suivre ce litige
                  </button>
                  
                  {order.dispute && (
                    <Link 
                      href={`/dashboard/disputes/${order.dispute.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/dashboard/disputes/${order.dispute.id}`;
                      }}
                      className="px-3 py-1 inline-flex items-center text-xs font-medium rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200"
                    >
                      <FiAlertCircle className="mr-1 h-3 w-3" />
                      Détails du litige
                    </Link>
                  )}
                </div>
              )}
              
              <motion.div 
                className="flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-700"
                whileHover={{ x: 2 }}
              >
                Voir détails
                <FiChevronRight className="ml-1 h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default OrderCard; 