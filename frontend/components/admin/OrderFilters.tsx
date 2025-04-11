import React, { useState } from 'react';
import { 
  FiFilter, 
  FiX, 
  FiCalendar, 
  FiDollarSign, 
  FiUser, 
  FiList,
  FiClock
} from 'react-icons/fi/index.js';
import { OrderFilterOptions } from '../../services/OrderService';

interface OrderFiltersProps {
  onApplyFilters: (filters: OrderFilterOptions) => void;
  initialFilters?: OrderFilterOptions;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ 
  onApplyFilters, 
  initialFilters = {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilterOptions>({
    status: initialFilters.status || 'all',
    dateRange: initialFilters.dateRange || 'all',
    minAmount: initialFilters.minAmount || undefined,
    maxAmount: initialFilters.maxAmount || undefined,
    client: initialFilters.client || '',
    freelancer: initialFilters.freelancer || '',
    paymentStatus: initialFilters.paymentStatus || 'all',
    category: initialFilters.category || 'all'
  });
  
  // Toggle l'affichage des filtres
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      minAmount: undefined,
      maxAmount: undefined,
      client: '',
      freelancer: '',
      paymentStatus: 'all',
      category: 'all'
    });
  };
  
  // Mettre à jour un filtre spécifique
  const updateFilter = (filterName: keyof OrderFilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Appliquer les filtres
  const applyFilters = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center">
          <FiFilter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiX className="-ml-1 mr-2 h-4 w-4" />
            Réinitialiser
          </button>
          
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Appliquer
          </button>
        </div>
      </div>
      
      {/* Filtres rapides toujours visibles */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="statusFilter"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.status || 'all'}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
            <option value="disputed">En litige</option>
            <option value="blocked">Bloquée</option>
            <option value="suspended">Suspendue</option>
            <option value="refunded">Remboursée</option>
          </select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="dateRangeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Période
          </label>
          <select
            id="dateRangeFilter"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.dateRange || 'all'}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
          >
            <option value="all">Toutes les périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">Cette année</option>
          </select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="paymentStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Statut de paiement
          </label>
          <select
            id="paymentStatusFilter"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.paymentStatus || 'all'}
            onChange={(e) => updateFilter('paymentStatus', e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="paid">Payé</option>
            <option value="refunded">Remboursé</option>
            <option value="partial">Partiel</option>
            <option value="held">Retenu</option>
            <option value="failed">Échoué</option>
          </select>
        </div>
      </div>
      
      {/* Filtres avancés */}
      {isOpen && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtres par montant */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiDollarSign className="mr-2 h-4 w-4 text-gray-500" />
                Filtrer par montant
              </h4>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="minAmount" className="block text-xs font-medium text-gray-500 mb-1">
                    Montant min
                  </label>
                  <input
                    type="number"
                    id="minAmount"
                    placeholder="Min"
                    min="0"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={filters.minAmount || ''}
                    onChange={(e) => updateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="maxAmount" className="block text-xs font-medium text-gray-500 mb-1">
                    Montant max
                  </label>
                  <input
                    type="number"
                    id="maxAmount"
                    placeholder="Max"
                    min="0"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={filters.maxAmount || ''}
                    onChange={(e) => updateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>
            
            {/* Filtres par personne */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiUser className="mr-2 h-4 w-4 text-gray-500" />
                Filtrer par personne
              </h4>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="clientFilter" className="block text-xs font-medium text-gray-500 mb-1">
                    Client
                  </label>
                  <input
                    type="text"
                    id="clientFilter"
                    placeholder="Nom du client"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={filters.client || ''}
                    onChange={(e) => updateFilter('client', e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="freelancerFilter" className="block text-xs font-medium text-gray-500 mb-1">
                    Freelancer
                  </label>
                  <input
                    type="text"
                    id="freelancerFilter"
                    placeholder="Nom du freelancer"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={filters.freelancer || ''}
                    onChange={(e) => updateFilter('freelancer', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre par catégorie */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiList className="mr-2 h-4 w-4 text-gray-500" />
                Filtrer par catégorie
              </h4>
              <div>
                <select
                  id="categoryFilter"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.category || 'all'}
                  onChange={(e) => updateFilter('category', e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="Développement web">Développement web</option>
                  <option value="Design graphique">Design graphique</option>
                  <option value="Marketing digital">Marketing digital</option>
                  <option value="Rédaction">Rédaction</option>
                  <option value="Traduction">Traduction</option>
                  <option value="Montage vidéo">Montage vidéo</option>
                  <option value="Formation">Formation</option>
                </select>
              </div>
            </div>
            
            {/* Filtre par date spécifique */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiCalendar className="mr-2 h-4 w-4 text-gray-500" />
                Dates spécifiques
              </h4>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="startDateFilter" className="block text-xs font-medium text-gray-500 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="startDateFilter"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="endDateFilter" className="block text-xs font-medium text-gray-500 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    id="endDateFilter"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={filters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters; 