import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { UniversalServiceCard } from '../services/UniversalServiceCard';
import { Service } from '../../types';

interface ServiceGridProps {
  services: Service[];
  isLoading: boolean;
  viewMode?: 'grid' | 'list';
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, isLoading, viewMode }) => {
  // Utiliser localStorage pour persister le type de vue entre les sessions
  const [viewType, setViewType] = useState<'grid' | 'list'>(() => {
    // Vérifier si on est côté client
    if (typeof window !== 'undefined') {
      const savedViewType = localStorage.getItem('serviceViewType');
      return (savedViewType === 'grid' || savedViewType === 'list') ? savedViewType : 'grid';
    }
    return 'grid';
  });
  
  // Utiliser viewMode (prop externe) s'il est défini, sinon utiliser viewType (state interne)
  const currentViewType = viewMode || viewType;

  const [sortOption, setSortOption] = useState<string>('popular');
  const [showSortOptions, setShowSortOptions] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortedServices, setSortedServices] = useState<Service[]>([]);

  // Mettre à jour localStorage quand le type de vue change
  const handleViewTypeChange = (type: 'grid' | 'list') => {
    setViewType(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem('serviceViewType', type);
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // Sort services based on selected option
  useEffect(() => {
    if (!services.length) return;

    const sorted = [...services].sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          // Traiter le cas où createdAt peut être undefined
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          return bDate - aDate;
        case 'popular':
        default:
          // Utiliser une propriété sûre si orderCount n'existe pas
          const aCount = (a as any).orderCount || 0;
          const bCount = (b as any).orderCount || 0;
          return bCount - aCount;
      }
    });

    setSortedServices(sorted);
  }, [services, sortOption]);

  // Handle sort change
  const handleSortChange = (option: string) => {
    setSortOption(option);
    setShowSortOptions(false);
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div className="font-medium text-gray-700">
          {isLoading ? (
            <span>Chargement des services...</span>
          ) : (
            <span>{sortedServices.length} services disponibles</span>
          )}
        </div>

        <div className="flex items-center space-x-4 self-end sm:self-auto">
          {/* View Type */}
          <div className="bg-gray-100 rounded-lg flex shadow-sm">
            <button
              onClick={() => handleViewTypeChange('grid')}
              className={`p-3 px-4 rounded-l-lg ${
                currentViewType === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Vue en grille"
              title="Vue en grille"
            >
              <span className="flex items-center">
                <FiGrid className="w-5 h-5" />
                <span className="ml-1 hidden xs:inline">Grille</span>
              </span>
            </button>
            <button
              onClick={() => handleViewTypeChange('list')}
              className={`p-3 px-4 rounded-r-lg ${
                currentViewType === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Vue en liste"
              title="Vue en liste"
            >
              <span className="flex items-center">
                <FiList className="w-5 h-5" />
                <span className="ml-1 hidden xs:inline">Liste</span>
              </span>
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <span className="hidden xs:inline">
                {sortOption === 'popular' && 'Les plus populaires'}
                {sortOption === 'price-low' && 'Prix: croissant'}
                {sortOption === 'price-high' && 'Prix: décroissant'}
                {sortOption === 'rating' && 'Mieux notés'}
                {sortOption === 'newest' && 'Plus récents'}
              </span>
              <span className="xs:hidden">Trier</span>
              <FiChevronDown className="w-4 h-4 ml-2" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showSortOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleSortChange('popular')}
                      className={`block px-4 py-2.5 text-sm w-full text-left ${
                        sortOption === 'popular' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      } hover:bg-gray-50`}
                    >
                      Les plus populaires
                    </button>
                    <button
                      onClick={() => handleSortChange('price-low')}
                      className={`block px-4 py-2.5 text-sm w-full text-left ${
                        sortOption === 'price-low' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      } hover:bg-gray-50`}
                    >
                      Prix: croissant
                    </button>
                    <button
                      onClick={() => handleSortChange('price-high')}
                      className={`block px-4 py-2.5 text-sm w-full text-left ${
                        sortOption === 'price-high' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      } hover:bg-gray-50`}
                    >
                      Prix: décroissant
                    </button>
                    <button
                      onClick={() => handleSortChange('rating')}
                      className={`block px-4 py-2.5 text-sm w-full text-left ${
                        sortOption === 'rating' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      } hover:bg-gray-50`}
                    >
                      Mieux notés
                    </button>
                    <button
                      onClick={() => handleSortChange('newest')}
                      className={`block px-4 py-2.5 text-sm w-full text-left ${
                        sortOption === 'newest' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      } hover:bg-gray-50`}
                    >
                      Plus récents
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des services...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedServices.length === 0 && (
        <div className="py-12 text-center">
          <div className="bg-gray-50 rounded-xl p-8 max-w-lg mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos filtres ou de rechercher autre chose.
            </p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
              onClick={() => window.location.reload()}
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {/* Services grid */}
      {!isLoading && sortedServices.length > 0 && (
        <div
          className={
            currentViewType === 'grid'
              ? 'grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
              : 'flex flex-col space-y-4 sm:space-y-6'
          }
        >
          {sortedServices.map((service) => (
            <UniversalServiceCard
              key={service.id}
              service={service}
              className={currentViewType === 'list' ? 'flex flex-col sm:flex-row' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 