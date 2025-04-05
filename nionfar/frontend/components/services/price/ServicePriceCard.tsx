import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock,
  FiRepeat,
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiShield,
  FiDollarSign,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Tooltip } from '../../ui/Tooltip';
import { CommanderButton } from '../buttons';
import { formatCurrency } from '../../../utils';
import { Service } from '../../../types';

interface ServicePriceCardProps {
  service: Service;
  onOrderClick?: () => void;
  onContactClick?: () => void;
  onAddToFavorites?: () => void;
  onShareClick?: () => void;
  canOrder?: boolean;
  cannotOrderReason?: string | null;
  isLoading?: boolean;
  isFavorite?: boolean;
  isAddingToFavorites?: boolean;
  className?: string;
}

export const ServicePriceCard: React.FC<ServicePriceCardProps> = ({
  service,
  onOrderClick,
  onContactClick,
  onAddToFavorites,
  onShareClick,
  canOrder = true,
  cannotOrderReason = null,
  isLoading = false,
  isFavorite = false,
  isAddingToFavorites = false,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Gestionnaires d'événements pour s'assurer que les fonctions de rappel existent
  const handleOrderClick = () => onOrderClick?.();
  const handleContactClick = () => onContactClick?.();
  const handleAddToFavorites = () => onAddToFavorites?.();
  const handleShareClick = () => onShareClick?.();

  // Toggle pour les détails supplémentaires
  const toggleDetails = () => setShowDetails(prev => !prev);

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header with price */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Prix du service</h3>
          <Badge 
            variant={service.isActive ? 'success' : 'warning'} 
            size="sm"
          >
            {service.isActive ? 'Disponible' : 'Indisponible'}
          </Badge>
        </div>
        
        {/* Prix et ancien prix */}
        <div className="flex items-baseline mb-5">
          <span className="text-3xl font-bold text-gray-900">{formatCurrency(service.price, 'XOF')}</span>
          {service.oldPrice && service.oldPrice > service.price && (
            <span className="ml-2 text-sm line-through text-gray-500">
              {formatCurrency(service.oldPrice, 'XOF')}
            </span>
          )}
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center space-x-2 mb-5">
          <Tooltip content={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
            <button
              onClick={handleAddToFavorites}
              disabled={isAddingToFavorites}
              className={`p-2 rounded-full border ${
                isFavorite 
                  ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                  : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
              } transition-all`}
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <FiHeart 
                className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''} ${isAddingToFavorites ? 'animate-pulse' : ''}`} 
                aria-hidden="true"
              />
            </button>
          </Tooltip>
          <Tooltip content="Partager">
            <button
              onClick={handleShareClick}
              className="p-2 rounded-full border border-gray-200 text-gray-500 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
              aria-label="Partager ce service"
            >
              <FiShare2 className="h-5 w-5" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
        
        {/* CTA Buttons */}
        <div className="space-y-3">
          {isLoading ? (
            <Button
              disabled
              loading
              className="w-full py-3 text-base font-medium shadow-md"
              variant="primary"
            >
              Vérification...
            </Button>
          ) : (
            <CommanderButton
              serviceId={service.id}
              sellerId={service.provider?.id || ''}
              className="py-3 text-base font-medium shadow-md"
              fullWidth
            />
          )}
          
          {service.provider && (
            <Button
              onClick={handleContactClick}
              className="w-full py-3 text-base font-medium"
              variant="outline"
              startIcon={<FiMessageCircle className="h-5 w-5" aria-hidden="true" />}
            >
              Contacter le vendeur
            </Button>
          )}
        </div>
      </div>

      {/* Service details */}
      <div className="p-6 bg-white">
        <h4 className="font-medium text-gray-900 mb-4">Ce service comprend :</h4>
        <ServiceFeaturesList service={service} />
        
        {/* Collapsible additional info */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <button
            className="flex w-full items-center justify-between text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            onClick={toggleDetails}
            aria-expanded={showDetails}
          >
            <span>Plus de détails</span>
            <FiChevronDown 
              className={`h-4 w-4 transition-transform ${showDetails ? 'transform rotate-180' : ''}`} 
              aria-hidden="true"
            />
          </button>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 text-sm text-gray-600 space-y-3"
              >
                <ServiceDetailsPanel service={service} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Payment methods and guarantees */}
      <PaymentMethodsPanel />
    </div>
  );
};

// Composant pour les fonctionnalités du service
const ServiceFeaturesList = ({ service }: { service: Service }) => (
  <ul className="space-y-3 mb-4">
    <li className="flex items-center text-sm">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
        <FiClock className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
      </div>
      <span className="text-gray-700">
        Livraison en <span className="font-semibold">{service.deliveryTime} jours</span>
      </span>
    </li>
    <li className="flex items-center text-sm">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
        <FiRepeat className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
      </div>
      <span className="text-gray-700">
        <span className="font-semibold">
          {service.revisions === 999 || service.revisions === undefined
            ? 'Illimitées' 
            : service.revisions
          }
        </span> révisions
      </span>
    </li>
    <li className="flex items-center text-sm">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
        <FiShield className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
      </div>
      <span className="text-gray-700">Garantie satisfaction</span>
    </li>
  </ul>
);

// Composant pour les détails supplémentaires
const ServiceDetailsPanel = ({ service }: { service: Service }) => (
  <>
    <div className="bg-gray-50 p-3 rounded-lg">
      <h5 className="font-medium text-gray-800 mb-2">Fonctionnalités incluses:</h5>
      <ul className="space-y-1.5">
        <li className="flex items-center">
          <FiChevronRight className="h-3.5 w-3.5 text-indigo-500 mr-1.5" aria-hidden="true" />
          Services de base
        </li>
        <li className="flex items-center">
          <FiChevronRight className="h-3.5 w-3.5 text-indigo-500 mr-1.5" aria-hidden="true" />
          Support par messagerie
        </li>
        <li className="flex items-center">
          <FiChevronRight className="h-3.5 w-3.5 text-indigo-500 mr-1.5" aria-hidden="true" />
          Livraison commerciale
        </li>
      </ul>
    </div>
    
    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
      <span className="text-gray-600">Délai de commande</span>
      <span className="font-medium">Immédiat</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-gray-600">Commandes en attente</span>
      <span className="font-medium">{service?.queuedOrders ?? 0}</span>
    </div>
    {service.price > 0 && (
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Frais de service</span>
        <span className="font-medium">
          {formatCurrency(service.price * 0.05, 'XOF')}
        </span>
      </div>
    )}
  </>
);

// Composant pour les méthodes de paiement
const PaymentMethodsPanel = () => (
  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
    <div className="flex items-center text-xs text-gray-600 mb-2">
      <FiDollarSign className="h-3.5 w-3.5 text-gray-500 mr-1.5" aria-hidden="true" />
      Paiement sécurisé
    </div>
    <div className="flex items-center justify-between">
      <div className="flex gap-1.5">
        <div className="h-6 w-10 rounded bg-white border border-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium">VISA</span>
        </div>
        <div className="h-6 w-10 rounded bg-white border border-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium">OM</span>
        </div>
        <div className="h-6 w-10 rounded bg-white border border-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium">Wave</span>
        </div>
      </div>
      
      <Link
        href="/payment-methods"
        className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
      >
        Voir tous
      </Link>
    </div>
  </div>
);