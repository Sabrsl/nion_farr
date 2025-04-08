import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiStar, FiClock, FiMapPin } from 'react-icons/fi';
import { Service } from '../../types';

// Image par défaut
const DEFAULT_IMAGE = '/images/placeholder-service.jpg';

interface ServiceGridItemProps {
  service: Service;
  className?: string;
}

export const ServiceGridItem: React.FC<ServiceGridItemProps> = ({ 
  service,
  className = ''
}) => {
  const { 
    id,
    slug,
    title, 
    image, 
    price, 
    rating = 0, 
    totalReviews = 0, 
    deliveryTime = 0, 
    provider,
    isFeatured
  } = service;

  // Construire l'URL du service
  const serviceUrl = `/services/${slug || id}`;

  return (
    <Link 
      href={serviceUrl}
      className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 ${className}`}
    >
      {/* Image du service */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={image || DEFAULT_IMAGE}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
          priority={isFeatured}
        />
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-1 rounded text-xs font-medium text-white shadow-sm">
            Populaire
          </div>
        )}
      </div>
      
      {/* Contenu du service */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            {/* Titre du service */}
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            
            {/* Information du prestataire et évaluations */}
            <div className="flex items-center text-sm text-gray-500 mb-2">
              {provider && (
                <>
                  <FiMapPin className="h-3 w-3 mr-1" aria-hidden="true" />
                  <span className="mr-2">{provider.name}</span>
                </>
              )}
              {rating > 0 && (
                <div className="flex items-center">
                  <FiStar className="h-3 w-3 text-amber-500 mr-0.5" aria-hidden="true" />
                  <span>{rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-400">({totalReviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Délai de livraison et prix */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <FiClock className="h-3 w-3 mr-1" aria-hidden="true" />
            <span>{deliveryTime} jours</span>
          </div>
          <div className="font-semibold text-indigo-600">
            {typeof price === 'number' ? price.toLocaleString() : price} FCFA
          </div>
        </div>
      </div>
    </Link>
  );
};