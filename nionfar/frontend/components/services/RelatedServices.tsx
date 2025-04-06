import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '../../types';
import { Rating } from '../ui/Rating';

// Mock data
import { mockServices } from '../../data/services';

// Image par défaut
const DEFAULT_IMAGE = '/images/placeholder-service.jpg';

interface RelatedServicesProps {
  services: Service[];
  currentServiceId: string;
  categoryId?: string;
  maxItems?: number;
  className?: string;
}

export const RelatedServices: React.FC<RelatedServicesProps> = ({ 
  services, 
  currentServiceId,
  categoryId,
  maxItems = 4,
  className = ''
}) => {
  // Déterminer les services à afficher
  const relatedServicesToShow = services && services.length > 0 
    ? services.slice(0, maxItems) 
    : mockServices
        .filter(service => 
          service.id !== currentServiceId && 
          (categoryId 
            ? (service.category && 
               typeof service.category === 'object' && 
               (service.category as {id: string}).id === categoryId)
            : true)
        )
        .slice(0, maxItems);

  // Si aucun service trouvé, ne rien afficher
  if (relatedServicesToShow.length === 0) {
    return null;
  }

  return (
    <div className={`mt-10 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Services similaires</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedServicesToShow.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};

// Composant de carte de service extrait pour une meilleure lisibilité
const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const { 
    id, 
    slug, 
    title, 
    image, 
    rating = 0, 
    totalReviews = 0, 
    price 
  } = service;

  return (
    <Link
      href={`/services/${slug || id}`}
      className="group block"
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={image || DEFAULT_IMAGE}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Rating value={rating} size="sm" readOnly />
            <span className="ml-1">
              ({totalReviews})
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-gray-900">
              {typeof price === 'number' ? price.toLocaleString() : price} FCFA
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};