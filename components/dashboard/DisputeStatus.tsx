import React from 'react';
import { FiAlertCircle, FiClock, FiCheckCircle, FiXCircle, FiActivity, FiMessageSquare } from 'react-icons/fi';
import { Dispute } from '../../types';

interface DisputeStatusProps {
  status: Dispute['status'];
  className?: string;
  showLabel?: boolean;
}

const DisputeStatus: React.FC<DisputeStatusProps> = ({ 
  status, 
  className = '',
  showLabel = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ouvert':
        return {
          icon: FiAlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: 'Ouvert'
        };
      case 'en_attente_de_reponse':
        return {
          icon: FiClock,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'En attente de réponse'
        };
      case 'en_traitement':
        return {
          icon: FiActivity,
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-100',
          label: 'En traitement'
        };
      case 'résolu_en_faveur_client':
        return {
          icon: FiCheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Résolu (client)'
        };
      case 'résolu_en_faveur_vendeur':
        return {
          icon: FiCheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Résolu (vendeur)'
        };
      case 'clos_automatiquement':
        return {
          icon: FiXCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Clos automatiquement'
        };
      case 'refusé':
        return {
          icon: FiXCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Refusé'
        };
      default:
        return {
          icon: FiMessageSquare,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Inconnu'
        };
    }
  };

  const { icon: Icon, color, bgColor, label } = getStatusConfig();

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className={`p-1 rounded-full ${bgColor}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </span>
      {showLabel && (
        <span className={`ml-2 text-sm font-medium ${color}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default DisputeStatus; 