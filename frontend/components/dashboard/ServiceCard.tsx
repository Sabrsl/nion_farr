import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiStar, 
  FiDollarSign,
  FiShoppingBag,
  FiUser,
  FiExternalLink,
  FiCalendar,
  FiClock
} from 'react-icons/fi';
import { Tooltip } from '../ui/Tooltip';
import { Service } from '../../types';
import { Rating } from '../ui/Rating';

interface ServiceCardProps {
  service: Service;
  onToggleStatus: (id: string) => void;
  onDeleteClick: (service: Service) => void;
  formatDate: (date: string) => string;
  getRatingColor: (rating: number | undefined) => string;
  variants?: any;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onToggleStatus, 
  onDeleteClick, 
  formatDate, 
  getRatingColor,
  variants 
}) => {
  const getRatingColorHandler = (rating: number | undefined): string => {
    if (!rating) return 'text-gray-500 bg-gray-100';
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4) return 'text-green-500 bg-green-50';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 3) return 'text-yellow-500 bg-yellow-50';
    return 'text-red-500 bg-red-50';
  };

  return (
    <motion.div 
      variants={variants}
      className={`bg-white rounded-xl shadow-sm border ${
        service.isActive ? 'border-gray-100' : 'border-gray-200'
      } overflow-hidden hover:shadow-lg transition-all duration-300 group`}
    >
      {/* Image du service avec overlay hover */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : service.images && Array.isArray(service.images) && service.images.length > 0 ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-500 text-sm">Aucune image</span>
          </div>
        )}
        
        {/* Status badge - repositionné pour meilleure visibilité */}
        <div className="absolute top-3 right-3 z-10">
          {service.isActive ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
              Actif
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm backdrop-blur-sm">
              <FiEyeOff className="mr-1.5 h-3 w-3" />
              Inactif
            </span>
          )}
        </div>
        
        {/* Category - légèrement repositionné */}
        {service.category && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center text-sm mb-2">
              <span className="font-semibold mr-2">
                {typeof service.category === 'string' 
                  ? service.category 
                  : (service.category as any).name || 'Catégorie'}
              </span>
              {typeof service.category === 'object' && (service.category as any)?.name && (
                <span className="text-gray-500">{(service.category as any).name}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Overlay avec boutons d'action améliorés */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
          <div className="flex w-full flex-col sm:flex-row gap-2 mb-2">
            <Link
              href={`/services/${service.slug || service.id}`}
              className="w-full text-center text-xs sm:text-sm font-medium text-white bg-black/50 hover:bg-black/70 px-3 py-2 rounded-md flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/10"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Voir public
            </Link>
            <Link
              href={`/dashboard/services/${service.id}`}
              className="w-full text-center text-xs sm:text-sm font-medium text-white bg-indigo-500/90 hover:bg-indigo-600 px-3 py-2 rounded-md flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            >
              <FiEye className="w-3.5 h-3.5 mr-1.5" />
              Voir détails
            </Link>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center ${getRatingColor(service.rating)} px-2 py-0.5 rounded-md text-xs font-medium border`}>
            <FiStar className="h-3.5 w-3.5 mr-1 fill-current" />
            <div className="flex items-center text-sm">
              <Rating
                value={service.rating !== undefined ? service.rating : 0}
                readOnly
                size="sm"
              />
              <span className="ml-1 text-gray-500">
                {service.rating ? service.rating.toFixed(1) : 'N/A'} ({service.totalReviews || 0})
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiShoppingBag className="mr-1 h-4 w-4" />
            <span>{service.orderCount || 0} commandes</span>
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 h-12 group-hover:text-indigo-700 transition-colors">
          {service.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          <div className="flex items-center">
            <FiCalendar className="h-3.5 w-3.5 mr-1" />
            {service.createdAt ? formatDate(service.createdAt) : 'Date inconnue'}
          </div>
          <div className="flex items-center">
            <FiClock className="h-3.5 w-3.5 mr-1" />
            <span>Livraison: {service.deliveryTime}j</span>
          </div>
        </div>
        
        {/* Tags if available */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {service.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                +{service.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Séparateur plus léger */}
        <div className="border-t border-gray-100 my-3"></div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-gray-900 flex items-center">
            <FiDollarSign className="h-4 w-4 mr-1 text-green-600" />
            {service.price.toLocaleString()} FCFA
          </span>
          
          {/* Actions en groupe avec espace égal et design amélioré */}
          <div className="flex flex-wrap gap-2 justify-end">
            <Tooltip content={service.isActive ? 'Désactiver' : 'Activer'} position="top">
              <button
                onClick={() => onToggleStatus(service.id)}
                className={`p-1.5 rounded-md ${
                  service.isActive 
                    ? 'text-gray-700 hover:bg-gray-200' 
                    : 'text-green-700 hover:bg-green-100'
                } transition-colors`}
              >
                {service.isActive ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </Tooltip>
            <Tooltip content="Modifier" position="top">
              <Link 
                href={`/dashboard/services/${service.id}/edit`}
                className="flex items-center px-3 py-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors text-xs font-medium"
              >
                <FiEdit2 className="h-3.5 w-3.5 mr-1.5" />
                Modifier
              </Link>
            </Tooltip>
            <Tooltip content="Supprimer" position="top">
              <button
                onClick={() => onDeleteClick(service)}
                className="p-1.5 rounded-md text-red-700 hover:bg-red-100 transition-colors"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 