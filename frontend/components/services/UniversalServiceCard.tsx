import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiStar, FiClock } from 'react-icons/fi/index.js';
import { Service } from '../../types';
import { CustomService } from '../../types/custom';

// Type qui peut gérer à la fois les services standard et personnalisés
type UniversalService = Service | CustomService;

interface UniversalServiceCardProps {
  service: UniversalService;
  viewType?: 'grid' | 'list';
  className?: string;
}

// Fonction helper pour vérifier si un service a une propriété spécifique
const hasProperty = <T extends object>(obj: T, prop: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

// Images par défaut
const DEFAULT_IMAGE = '/img/services/default-service.jpg';
const DEFAULT_AVATAR = '/img/avatar-placeholder.jpg';

export const UniversalServiceCard: React.FC<UniversalServiceCardProps> = ({ 
  service,
  viewType = 'grid',
  className = ""
}) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Extraire les propriétés communes ou fournir des valeurs par défaut
  const {
    id,
    title,
    price,
    image,
    rating = 0,
    totalReviews = 0,
    deliveryTime,
    provider,
    slug,
    isActive = true
  } = service;

  // Vérifier les propriétés optionnelles
  const category = hasProperty(service, 'category') ? (service as any).category : null;

  // Ne pas afficher les services inactifs
  if (!isActive) {
    return null;
  }

  // Construire l'URL du service
  const serviceUrl = `/services/${slug || id}`;

  // Gestionnaire de clic pour la navigation
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Éviter les navigations multiples simultanées
    if (isNavigating) return;
    
    setIsNavigating(true);
    router.push(serviceUrl)
      .catch(err => {
        console.error('Navigation error:', err);
        setIsNavigating(false);
      });
  };

  // Rendu des métadonnées réutilisables (rating, delivery time)
  const renderMetadata = () => (
    <div className="mt-1.5 sm:mt-2 flex items-center text-xs sm:text-sm text-gray-500">
      {rating > 0 && (
        <div className="flex items-center">
          <FiStar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400" />
          <span className="ml-0.5 sm:ml-1">{rating.toFixed(1)}</span>
          {totalReviews > 0 && (
            <span className="ml-0.5 sm:ml-1">({totalReviews})</span>
          )}
        </div>
      )}
      
      {deliveryTime && (
        <div className="flex items-center ml-3 sm:ml-4">
          <FiClock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="ml-0.5 sm:ml-1">{deliveryTime}</span>
        </div>
      )}
    </div>
  );

  // Rendu des informations du prestataire
  const renderProvider = () => (
    provider && (
      <div className="mt-1.5 sm:mt-2 flex items-center">
        <div className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 relative">
          <img
            src={provider.avatar || DEFAULT_AVATAR}
            alt={provider.name}
            className="rounded-full object-cover w-full h-full"
          />
        </div>
        <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-500">
          {provider.name}
        </span>
      </div>
    )
  );

  // Rendu du prix
  const renderPrice = () => (
    <div className="mt-1.5 sm:mt-2">
      <span className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
        {typeof price === 'number' ? price.toLocaleString() : price} FCFA
      </span>
    </div>
  );

  // Vue en liste
  if (viewType === 'list') {
    return (
      <Link href={serviceUrl} legacyBehavior>
        <a className="block">
          <div className={`block p-2 sm:p-4 hover:bg-gray-50 transition-colors duration-200 ${className} cursor-pointer`}>
            <div className="flex items-start space-x-2 sm:space-x-4">
              {/* Image du service */}
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative">
                <img
                  src={image || DEFAULT_IMAGE}
                  alt={title}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 truncate">
                  {title}
                </h3>
                
                {renderProvider()}
                {renderMetadata()}
                {renderPrice()}
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  }

  // Vue en grille (par défaut)
  return (
    <Link href={serviceUrl} legacyBehavior>
      <a className="block">
        <div className={`block group cursor-pointer ${className}`}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Image du service */}
            <div className="relative h-32 sm:h-40 md:h-48">
              <img
                src={image || DEFAULT_IMAGE}
                alt={title}
                className="object-cover group-hover:opacity-90 transition-opacity duration-200 w-full h-full"
              />
            </div>

            {/* Contenu */}
            <div className="p-2 sm:p-3 md:p-4">
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 truncate">
                {title}
              </h3>

              {renderProvider()}
              {renderMetadata()}
              {renderPrice()}
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};