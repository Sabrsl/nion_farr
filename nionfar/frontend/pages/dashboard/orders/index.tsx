import { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FiFilter, 
  FiChevronDown,
  FiSearch,
  FiMessageSquare,
  FiCalendar,
  FiCheck,
  FiUser,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiShoppingBag,
  FiRefreshCw,
  FiSliders,
  FiEye,
  FiArrowRight,
  FiX
} from 'react-icons/fi';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Order } from '../../../types';
import { freelancerOrders } from '../../../data/mockData';

const OrdersPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Stats des commandes (pour l'affichage du résumé)
  const orderStats = useMemo(() => {
    if (!orders.length) return { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0, revision: 0 };
    
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      inProgress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      revision: orders.filter(o => o.status === 'revision').length
    };
  }, [orders]);

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' FCFA';
  };

  useEffect(() => {
    // Simuler le chargement des données
    const fetchData = async () => {
      try {
        // En production, ceci serait une vraie requête API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(freelancerOrders);
        setFilteredOrders(freelancerOrders);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtre et tri des commandes
  useEffect(() => {
    let filtered = [...orders];
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        order => 
          order.id.toLowerCase().includes(query) ||
          order.title.toLowerCase().includes(query) ||
          order.client.username.toLowerCase().includes(query)
      );
    }
    
    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'deadline-asc':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'deadline-desc':
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery, sortBy]);

  // Rafraîchir les données
  const refreshData = () => {
    setIsLoading(true);
    // Simuler le chargement des données
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setSortBy('date-desc');
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Terminée
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            En cours
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Annulée
          </span>
        );
      case 'revision':
        return (
          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Révision
          </span>
        );
      default:
        return null;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Vérifier si la date d'échéance est proche (moins de 2 jours)
  const isDeadlineClose = (deadline: string) => {
    return new Date(deadline).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000;
  };

  // Squelette de chargement
  if (isLoading) {
    return (
      <DashboardLayout title="Mes Commandes | NionFar.sn">
        <div className="p-6 sm:p-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="h-36 bg-gray-200 rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes Commandes | NionFar.sn">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* En-tête avec compteur et bouton de rafraîchissement */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
            Mes Commandes
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
              <span className="text-gray-500">Total:</span>{' '}
              <span className="font-medium text-gray-900">{filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}</span>
            </div>
            <button 
              onClick={refreshData}
              className="flex items-center gap-1.5 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Cards résumé des statuts */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-md'}`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs">Total</span>
              <div className="bg-gray-100 p-1.5 rounded-md">
                <FiShoppingBag className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{orderStats.total}</div>
          </div>
          
          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer transition-all ${statusFilter === 'pending' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-md'}`}
            onClick={() => setStatusFilter('pending')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs">En attente</span>
              <div className="bg-yellow-100 p-1.5 rounded-md">
                <FiClock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{orderStats.pending}</div>
          </div>
          
          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer transition-all ${statusFilter === 'in_progress' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-md'}`}
            onClick={() => setStatusFilter('in_progress')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs">En cours</span>
              <div className="bg-blue-100 p-1.5 rounded-md">
                <FiCalendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{orderStats.inProgress}</div>
          </div>
          
          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer transition-all ${statusFilter === 'completed' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-md'}`}
            onClick={() => setStatusFilter('completed')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs">Terminées</span>
              <div className="bg-green-100 p-1.5 rounded-md">
                <FiCheck className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{orderStats.completed}</div>
          </div>
          
          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer transition-all ${statusFilter === 'revision' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-md'}`}
            onClick={() => setStatusFilter('revision')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs">Révisions</span>
              <div className="bg-purple-100 p-1.5 rounded-md">
                <FiMessageSquare className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{orderStats.revision}</div>
          </div>
        </div>

        {/* Filtres et recherche - Version desktop */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 hidden md:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Filtre par statut */}
              <div className="relative">
                <label htmlFor="status-filter-desktop" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <div className="relative">
                  <select
                    id="status-filter-desktop"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminées</option>
                    <option value="revision">Révisions</option>
                    <option value="cancelled">Annulées</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FiChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Tri par */}
              <div className="relative">
                <label htmlFor="sort-by-desktop" className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <div className="relative">
                  <select
                    id="sort-by-desktop"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="date-desc">Date (récent → ancien)</option>
                    <option value="date-asc">Date (ancien → récent)</option>
                    <option value="price-desc">Prix (élevé → bas)</option>
                    <option value="price-asc">Prix (bas → élevé)</option>
                    <option value="deadline-asc">Échéance (proche → lointaine)</option>
                    <option value="deadline-desc">Échéance (lointaine → proche)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FiChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="w-full max-w-xs">
              <label htmlFor="search-desktop" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-desktop"
                  placeholder="ID, titre, client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres mobile */}
        <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 flex items-center justify-between">
            <div className="relative flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="ml-4 flex items-center text-sm text-indigo-600 px-2.5 py-1.5 border border-indigo-600 rounded-lg"
            >
              <FiSliders className="h-4 w-4 mr-1" />
              Filtres
            </button>
          </div>
          
          {mobileFiltersOpen && (
            <div className="p-4 pt-0 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                {/* Filtre par statut */}
                <div className="relative">
                  <label htmlFor="status-filter-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <div className="relative">
                    <select
                      id="status-filter-mobile"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminées</option>
                      <option value="revision">Révisions</option>
                      <option value="cancelled">Annulées</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FiChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Tri par */}
                <div className="relative">
                  <label htmlFor="sort-by-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Trier par
                  </label>
                  <div className="relative">
                    <select
                      id="sort-by-mobile"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="date-desc">Date (récent → ancien)</option>
                      <option value="date-asc">Date (ancien → récent)</option>
                      <option value="price-desc">Prix (élevé → bas)</option>
                      <option value="price-asc">Prix (bas → élevé)</option>
                      <option value="deadline-asc">Échéance (proche)</option>
                      <option value="deadline-desc">Échéance (lointaine)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FiChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    resetFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gray-50 transition-colors ${hoveredRow === order.id ? 'bg-gray-50' : ''}`}
                      onMouseEnter={() => setHoveredRow(order.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">{order.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-200 overflow-hidden">
                            {order.client.avatar ? (
                              <img 
                                src={order.client.avatar} 
                                alt={order.client.username}
                                className="h-9 w-9 object-cover"
                              />
                            ) : (
                              <div className="h-9 w-9 flex items-center justify-center bg-indigo-100 text-indigo-600">
                                <FiUser className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {order.client.username}
                              {order.client.isVerified && (
                                <FiCheck className="ml-1 h-3.5 w-3.5 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.price)}</div>
                        <div className="text-xs text-gray-500">
                          {order.isPaid ? (
                            <span className="text-green-600 flex items-center">
                              <FiCheck className="h-3 w-3 mr-1" /> Payé
                            </span>
                          ) : (
                            <span className="text-yellow-600 flex items-center">
                              <FiClock className="h-3 w-3 mr-1" /> En attente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                        {order.messages && order.messages > 0 && (
                          <div className="mt-1.5 flex items-center text-xs text-indigo-600">
                            <FiMessageSquare className="h-3 w-3 mr-1" />
                            {order.messages} message{order.messages > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {formatDate(order.deadline)}
                        </div>
                        
                        {/* Alerte si moins de 2 jours avant échéance */}
                        {isDeadlineClose(order.deadline) && 
                         order.status !== 'completed' && order.status !== 'cancelled' && (
                          <div className="mt-1.5 flex items-center text-xs text-red-600">
                            <FiAlertCircle className="h-3 w-3 mr-1" />
                            Échéance proche
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col items-end gap-1.5">
                          <Link 
                            href={`/dashboard/orders/${order.id}`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            <FiEye className="h-3.5 w-3.5 mr-1.5" />
                            Voir détails
                          </Link>
                          {order.status === 'pending' && (
                            <button 
                              className="text-red-600 hover:text-red-900 flex items-center text-xs px-3 py-1 rounded-lg hover:bg-red-50 transition-colors" 
                              onClick={() => alert('Fonctionnalité non implémentée')}
                            >
                              <FiXCircle className="h-3 w-3 mr-1.5" /> 
                              Refuser
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 flex flex-col items-center justify-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <FiFilter className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">Aucune commande trouvée</p>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  {statusFilter !== 'all' || searchQuery ? 
                    "Nous n'avons trouvé aucune commande correspondant à vos critères de recherche." : 
                    "Vous n'avez actuellement aucune commande. Les commandes que vous recevez apparaîtront ici."
                  }
                </p>
                {(statusFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiRefreshCw className="h-4 w-4 mr-2" />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Pagination (si nécessaire) */}
        {filteredOrders.length > 0 && filteredOrders.length > 10 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Précédent
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">1</span> à <span className="font-medium">10</span> sur{' '}
                  <span className="font-medium">{filteredOrders.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Précédent</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-indigo-500 bg-indigo-50 text-sm font-medium text-indigo-600 hover:bg-indigo-100">
                    2
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    3
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    10
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Suivant</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Fixé en bas sur mobile - Actions rapides */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 py-3 px-4">
          <div className="flex justify-between">
            <div className="flex-1 mr-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="revision">Révisions</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <FiFilter className="mr-1.5 h-4 w-4" />
              Filtrer
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;