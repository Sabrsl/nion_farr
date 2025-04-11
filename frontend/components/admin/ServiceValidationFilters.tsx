import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi/index.js';
import { ServiceStatus } from './ServiceValidationTable';

interface ServiceCategory {
  id: string;
  name: string;
}

interface ServiceValidationFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (status: string) => void;
  onCategoryChange: (categoryId: string) => void;
  categories: ServiceCategory[];
  totalServices: number;
  filteredServicesCount: number;
}

const ServiceValidationFilters: React.FC<ServiceValidationFiltersProps> = ({
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  categories,
  totalServices,
  filteredServicesCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Statuts de validation disponibles
  const validationStatuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'validated', label: 'Validé (hors ligne)' },
    { value: 'validated_prod', label: 'En production (en ligne)' },
    { value: 'rejected', label: 'Rejeté' },
    { value: 'revision', label: 'En révision' }
  ];

  // Détecter si des filtres sont appliqués
  useEffect(() => {
    setFiltersApplied(
      searchTerm !== '' || selectedStatus !== '' || selectedCategory !== ''
    );
  }, [searchTerm, selectedStatus, selectedCategory]);

  // Gérer la recherche
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  // Gérer le changement de statut
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatus(value);
    onStatusChange(value);
  };

  // Gérer le changement de catégorie
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onCategoryChange(value);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedCategory('');
    onSearchChange('');
    onStatusChange('');
    onCategoryChange('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Rechercher un service..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Bouton pour afficher/masquer les filtres */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiFilter className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Filtres {filtersApplied && '(Appliqués)'}
            <FiChevronDown className="ml-1 h-4 w-4" />
          </button>
          
          {filtersApplied && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiX className="mr-1 h-4 w-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Section filtres avancés */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtre par statut de validation */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Statut de validation
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={handleStatusChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {validationStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Compteur de résultats */}
      <div className="mt-4 text-sm text-gray-500">
        {filteredServicesCount} service{filteredServicesCount !== 1 ? 's' : ''} sur {totalServices} trouvé{totalServices !== 1 ? 's' : ''}
        {filtersApplied && ' avec les filtres appliqués'}
      </div>
    </div>
  );
};

export default ServiceValidationFilters; 