import React from 'react';
import { FiClock } from 'react-icons/fi/index.js';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { formatCurrency } from '../../utils/formatters';
import { Rating } from '../ui/Rating';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  deliveryTime: number;
  image?: string;
  rating?: number;
  totalReviews?: number;
  category?: string;
}

interface ServiceCardProps {
  service: Service;
  href: string;
  variant?: 'default' | 'freelancer-profile';
  className?: string;
}

// Image par défaut
const DEFAULT_IMAGE = '/img/placeholder.svg';

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  href,
  variant = 'default',
  className = '',
}) => {
  const router = useRouter();
  
  // Gérer la navigation programmatique
  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  const {
    title,
    description,
    price,
    deliveryTime,
    image,
    rating = 0,
    totalReviews = 0,
    category
  } = service;

  return (
    <a href={href} onClick={handleNavigation} className="block group">
      <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all transform hover:shadow-md border border-gray-100 hover:border-indigo-200 ${className}`}>
        {/* Image du service */}
        <div className="relative h-48 w-full">
          <Image
            src={image || DEFAULT_IMAGE}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:opacity-95 transition-opacity"
            onError={() => {/* Erreur gérée automatiquement par Next.js Image */}}
          />
          {category && variant === 'default' && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md shadow-sm">
              {category}
            </div>
          )}
        </div>
        
        {/* Contenu du service */}
        <div className="p-4">
          {/* Titre */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
          </h3>
          
          {/* Description (conditionnelle) */}
          {description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          {/* Notations et temps de livraison */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <Rating value={rating} readOnly size="sm" />
              <span className="text-sm text-gray-600 ml-2">
                ({totalReviews})
              </span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <FiClock className="h-3 w-3 mr-1" />
              <span>{deliveryTime} jours</span>
            </div>
          </div>
          
          {/* Prix et appel à l'action */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-lg font-bold text-indigo-600">
              {formatCurrency(price, 'XOF')}
            </span>
            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
              Voir les détails
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};