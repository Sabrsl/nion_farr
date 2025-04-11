import React, { useEffect, useState } from 'react';
import { Service } from '../../types';
import { UniversalServiceCard } from './UniversalServiceCard';
import axios from 'axios';
import { FiStar } from 'react-icons/fi/index.js';
import Link from 'next/link';

interface RelatedServicesProps {
  services?: Service[];
  currentServiceId?: string;
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
  const [relatedServicesToShow, setRelatedServicesToShow] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer des services similaires si pas fournis en props
  useEffect(() => {
    const fetchRelatedServices = async () => {
      // Si les services sont déjà fournis, les utiliser directement
      if (services && services.length > 0) {
        setRelatedServicesToShow(services.slice(0, maxItems));
        return;
      }

      // Sinon, faire un appel API pour les récupérer
      if (categoryId && currentServiceId) {
        try {
          setIsLoading(true);
          const response = await axios.get(`/api/services/related`, {
            params: {
              categoryId,
              exclude: currentServiceId,
              limit: maxItems
            }
          });
          
          if (response.data && response.data.services) {
            setRelatedServicesToShow(response.data.services);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des services similaires:", error);
          setRelatedServicesToShow([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchRelatedServices();
  }, [services, currentServiceId, categoryId, maxItems]);

  // Si aucun service trouvé et pas en chargement, ne rien afficher
  if (relatedServicesToShow.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={`mt-10 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Services similaires</h2>
      
      {isLoading ? (
        // Afficher des squelettes de chargement
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(maxItems).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-100 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      ) : (
        // Afficher les services
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedServicesToShow.map((service) => (
            <Link 
              key={service.id}
              href={`/services/${service.slug}`}
              legacyBehavior
            >
              <a className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-video">
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md mb-2">
                    <img
                      src={service.image || '/img/placeholder.svg'}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiStar className="h-4 w-4 text-amber-400 mr-1" /> 
                      {service.rating || '4.5'}
                    </div>
                    <div className="font-semibold text-indigo-600">
                      {service.price.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};