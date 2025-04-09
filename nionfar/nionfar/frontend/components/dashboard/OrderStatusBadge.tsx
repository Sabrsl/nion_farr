import React from 'react';
import { OrderStatus } from '../../types';
import { 
  FiClock, 
  FiCheck, 
  FiAlertCircle, 
  FiRefreshCw
} from 'react-icons/fi/index.js';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showText?: boolean;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  className = '', 
  showText = true 
}) => {
  // Fonction pour déterminer la couleur et l'icône du statut
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente_acceptation':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <FiClock className="h-4 w-4" />,
          text: 'En attente d\'acceptation'
        };
      case 'en_cours':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <FiClock className="h-4 w-4" />,
          text: 'En cours'
        };
      case 'livré':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <FiCheck className="h-4 w-4" />,
          text: 'Livré'
        };
      case 'en_modification':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: <FiRefreshCw className="h-4 w-4" />,
          text: 'En modification'
        };
      case 'terminée':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <FiCheck className="h-4 w-4" />,
          text: 'Terminée'
        };
      case 'annulée':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <FiAlertCircle className="h-4 w-4" />,
          text: 'Annulée'
        };
      case 'litige':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <FiAlertCircle className="h-4 w-4" />,
          text: 'Litige'
        };
      case 'livraison_en_retard':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <FiAlertCircle className="h-4 w-4" />,
          text: 'Livraison en retard'
        };
      case 'en_attente_paiement':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <FiClock className="h-4 w-4" />,
          text: 'En attente de paiement'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <FiClock className="h-4 w-4" />,
          text: status
        };
    }
  };

  const { color, icon, text } = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
      {icon}
      {showText && <span className="ml-1">{text}</span>}
    </span>
  );
};

export default OrderStatusBadge; 