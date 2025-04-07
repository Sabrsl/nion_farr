import React, { useEffect, useState } from 'react';
import { Service } from '../../types';
import { UniversalServiceCard } from './UniversalServiceCard';
import axios from 'axios';

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
            <UniversalServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};