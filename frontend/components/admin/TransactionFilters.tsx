import React, { useState } from 'react';
import { 
  FiFilter, 
  FiX, 
  FiChevronDown, 
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiSearch
} from 'react-icons/fi/index.js';

interface TransactionFiltersProps {
  onApplyFilters: (filters: any) => void;
  initialFilters?: any;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  onApplyFilters,
  initialFilters = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: initialFilters.type || 'all',
    status: initialFilters.status || 'all',
    dateRange: initialFilters.dateRange || 'month',
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    minAmount: initialFilters.minAmount || '',
    maxAmount: initialFilters.maxAmount || '',
    userType: initialFilters.userType || 'all',
    searchTerm: initialFilters.searchTerm || '',
    paymentMethod: initialFilters.paymentMethod || 'all'
  });

  const handleChange = (name: string, value: string | number) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: 'all',
      status: 'all',
      dateRange: 'month',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      userType: 'all',
      searchTerm: '',
      paymentMethod: 'all'
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div 
        className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <FiFilter className="mr-2 h-5 w-5 text-gray-500" />
          Filtres avancés
        </h3>
        <FiChevronDown 
          className={`h-5 w-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {isExpanded && (
        <div className="px-4 py-5 sm:p-6 overflow-x-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {/* Type de transaction */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type de transaction
                </label>
                <select
                  id="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="payment">Paiements</option>
                  <option value="payout">Retraits</option>
                  <option value="refund">Remboursements</option>
                  <option value="commission">Commissions</option>
                </select>
              </div>
              
              {/* Statut */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  id="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Terminées</option>
                  <option value="pending">En attente</option>
                  <option value="processing">En cours</option>
                  <option value="failed">Échouées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
              
              {/* Période prédéfinie */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                  Période
                </label>
                <select
                  id="dateRange"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.dateRange}
                  onChange={(e) => handleChange('dateRange', e.target.value)}
                >
                  <option value="all">Toute période</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                  <option value="custom">Période personnalisée</option>
                </select>
              </div>
              
              {/* Dates personnalisées */}
              {filters.dateRange === 'custom' && (
                <>
                  <div className="sm:col-span-1 md:col-span-3">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Date de début
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="startDate"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        value={filters.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-1 md:col-span-3">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      Date de fin
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="endDate"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        value={filters.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Montant minimum */}
              <div className="sm:col-span-1 md:col-span-3">
                <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700">
                  Montant minimum
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="minAmount"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0"
                    min="0"
                    value={filters.minAmount}
                    onChange={(e) => handleChange('minAmount', e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">XOF</span>
                  </div>
                </div>
              </div>
              
              {/* Montant maximum */}
              <div className="sm:col-span-1 md:col-span-3">
                <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700">
                  Montant maximum
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="maxAmount"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="100000"
                    min="0"
                    value={filters.maxAmount}
                    onChange={(e) => handleChange('maxAmount', e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">XOF</span>
                  </div>
                </div>
              </div>
              
              {/* Type d'utilisateur */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  Type d'utilisateur
                </label>
                <select
                  id="userType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.userType}
                  onChange={(e) => handleChange('userType', e.target.value)}
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option value="client">Clients</option>
                  <option value="freelancer">Freelancers</option>
                  <option value="admin">Administrateurs</option>
                </select>
              </div>
              
              {/* Méthode de paiement */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  Méthode de paiement
                </label>
                <select
                  id="paymentMethod"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                >
                  <option value="all">Toutes les méthodes</option>
                  <option value="card">Carte bancaire</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="wave">Wave</option>
                  <option value="free_money">Free Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                </select>
              </div>
              
              {/* Terme de recherche */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">
                  Recherche
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="searchTerm"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="ID, description, utilisateur..."
                    value={filters.searchTerm}
                    onChange={(e) => handleChange('searchTerm', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-between sm:justify-end space-y-3 sm:space-y-0 space-x-0 sm:space-x-3">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleReset}
              >
                <FiX className="mr-2 -ml-1 h-4 w-4" />
                Réinitialiser
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiFilter className="mr-2 -ml-1 h-4 w-4" />
                Appliquer les filtres
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters; 