import { NextPage } from 'next';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiStar, 
  FiSearch,
  FiChevronDown,
  FiDollarSign,
  FiShoppingBag,
  FiBarChart2,
  FiFilter,
  FiUser,
  FiX,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiExternalLink
} from 'react-icons/fi';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Service } from '../../../types';
import { freelancerServices } from '../../../data/mockData';
import { Tab } from '@headlessui/react';
import { Dialog } from '@headlessui/react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { Badge } from '../../../components/ui/Badge';
import { ServiceCard } from '../../../components/dashboard/ServiceCard';

const ServicesPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<number>(0);

  // Stats for dashboard summary
  const stats = useMemo(() => {
    if (!services.length) return {
      total: 0,
      active: 0,
      inactive: 0,
      avgRating: 0,
      totalOrders: 0,
      totalRevenue: 0
    };

    const active = services.filter(s => s.isActive).length;
    return {
      total: services.length,
      active,
      inactive: services.length - active,
      avgRating: services.reduce((acc, s) => acc + s.rating, 0) / services.length,
      totalOrders: services.reduce((acc, s) => acc + s.orderCount, 0),
      totalRevenue: services.reduce((acc, s) => acc + (s.price * s.orderCount), 0)
    };
  }, [services]);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setServices(freelancerServices);
      setFilteredServices(freelancerServices);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter and sort services when filters change
    let filtered = [...services];
    
    // Filter by tab/status first
    if (activeTab === 1) {
      filtered = filtered.filter(service => service.isActive);
    } else if (activeTab === 2) {
      filtered = filtered.filter(service => !service.isActive);
    }
    
    // Then by status if on "All" tab
    if (activeTab === 0 && statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(service => service.isActive === isActive);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category && service.category.id === categoryFilter);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        service => 
          service.title.toLowerCase().includes(query) ||
          (service.description && service.description.toLowerCase().includes(query)) ||
          (service.tags && service.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Sort
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
        case 'orders-asc':
          return a.orderCount - b.orderCount;
        case 'orders-desc':
          return b.orderCount - a.orderCount;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    setFilteredServices(filtered);
  }, [services, statusFilter, categoryFilter, searchQuery, sortBy, activeTab]);

  const toggleServiceStatus = (serviceId: string) => {
    // Update service status
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive } 
        : service
    ));
  };

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedService) {
      // Delete service
      setServices(services.filter(service => service.id !== selectedService.id));
      setIsDeleteModalOpen(false);
      setSelectedService(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Generate skeleton loaders
  const renderSkeletons = () => (
    <div className="animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-24 p-4 shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
      
      {/* Filter Bar Skeleton */}
      <div className="h-16 bg-white rounded-xl shadow-sm mb-6"></div>
      
      {/* Services Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm h-80"></div>
        ))}
      </div>
    </div>
  );

  // Calculate color for rating badge
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 text-green-700 border-green-200';
    if (rating >= 4) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (rating >= 3.5) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (rating >= 3) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mes Services | NionFar.sn">
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          {renderSkeletons()}
        </div>
      </DashboardLayout>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <DashboardLayout title="Mes Services | NionFar.sn">
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Services</h1>
            <p className="text-gray-500 mt-1">Gérez vos offres et suivez leur performance</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Nouveau service
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div 
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group"
            variants={itemVariants}
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full z-0 group-hover:bg-indigo-100 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <FiShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 relative z-10">
              <span className={`font-medium ${stats.active > stats.inactive ? 'text-green-600' : 'text-yellow-600'}`}>
                {Math.round(stats.active / (stats.total || 1) * 100)}%
              </span> actifs
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group"
            variants={itemVariants}
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full z-0 group-hover:bg-green-100 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500">Commandes</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</h3>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                <FiBarChart2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 relative z-10">
              <span className="font-medium text-green-600">~{Math.round(stats.totalOrders / (stats.active || 1))}</span> par service actif
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group"
            variants={itemVariants}
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full z-0 group-hover:bg-blue-100 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenu généré</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRevenue.toLocaleString()} FCFA</h3>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                <FiDollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 relative z-10">
              <span className="font-medium text-blue-600">{(stats.totalRevenue / (stats.totalOrders || 1)).toLocaleString()} FCFA</span> par commande
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group"
            variants={itemVariants}
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50 rounded-bl-full z-0 group-hover:bg-yellow-100 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500">Note moyenne</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1 flex items-center">
                  {stats.avgRating.toFixed(1)}
                  <FiStar className="h-4 w-4 ml-1 fill-current text-yellow-400" />
                </h3>
              </div>
              <div className="p-2.5 bg-yellow-50 rounded-lg text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                <FiStar className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 relative z-10">
              Sur l'ensemble de vos services
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-8"
        >
          <Tab.Group onChange={(index) => setActiveTab(index)}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-auto p-4 border-b sm:border-b-0 sm:border-r border-gray-100">
                  <Tab.List className="flex space-x-1 p-1 bg-gray-100/80 rounded-lg">
                    <Tab 
                      className={({ selected }) =>
                        `py-2 px-4 text-sm font-medium rounded-md transition-all ${
                          selected 
                            ? 'bg-white text-indigo-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'
                        }`
                      }
                    >
                      Tous ({services.length})
                    </Tab>
                    <Tab 
                      className={({ selected }) =>
                        `py-2 px-4 text-sm font-medium rounded-md transition-all ${
                          selected 
                            ? 'bg-white text-green-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'
                        }`
                      }
                    >
                      Actifs ({stats.active})
                    </Tab>
                    <Tab 
                      className={({ selected }) =>
                        `py-2 px-4 text-sm font-medium rounded-md transition-all ${
                          selected 
                            ? 'bg-white text-gray-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'
                        }`
                      }
                    >
                      Inactifs ({stats.inactive})
                    </Tab>
                  </Tab.List>
                </div>
                
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label htmlFor="category-filter" className="block text-xs font-medium text-gray-700 mb-1">
                        Catégorie
                      </label>
                      <div className="relative">
                        <select
                          id="category-filter"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        >
                          <option value="all">Toutes les catégories</option>
                          <option value="CAT-001">Design graphique</option>
                          <option value="CAT-002">UI/UX Design</option>
                          <option value="CAT-003">Développement web</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <FiChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label htmlFor="sort-by" className="block text-xs font-medium text-gray-700 mb-1">
                        Trier par
                      </label>
                      <div className="relative">
                        <select
                          id="sort-by"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        >
                          <option value="date-desc">Date (récent → ancien)</option>
                          <option value="date-asc">Date (ancien → récent)</option>
                          <option value="price-desc">Prix (élevé → bas)</option>
                          <option value="price-asc">Prix (bas → élevé)</option>
                          <option value="orders-desc">Commandes (élevé → bas)</option>
                          <option value="orders-asc">Commandes (bas → élevé)</option>
                          <option value="rating-desc">Note (élevé → bas)</option>
                          <option value="rating-asc">Note (bas → élevé)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <FiChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Search */}
                    <div>
                      <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                        Rechercher
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="search"
                          placeholder="Titre, description, tags..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <FiX className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t sm:border-t-0 sm:border-l border-gray-100 flex items-end">
                  <div className="flex space-x-2 items-center">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 text-indigo-600' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'}`}
                      aria-label="Vue grille"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 text-indigo-600' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'}`}
                      aria-label="Vue liste"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Tab.Panels>
                <Tab.Panel>
                  {filteredServices.length > 0 ? (
                    <ServicesList 
                      services={filteredServices} 
                      viewMode={viewMode} 
                      onToggleStatus={toggleServiceStatus}
                      onDeleteClick={handleDeleteClick}
                      formatDate={formatDate}
                      getRatingColor={getRatingColor}
                    />
                  ) : (
                    <EmptyState 
                      status={statusFilter} 
                      category={categoryFilter} 
                      search={searchQuery}
                      onReset={() => {
                        setStatusFilter('all');
                        setCategoryFilter('all');
                        setSearchQuery('');
                      }}
                    />
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {filteredServices.length > 0 ? (
                    <ServicesList 
                      services={filteredServices} 
                      viewMode={viewMode} 
                      onToggleStatus={toggleServiceStatus}
                      onDeleteClick={handleDeleteClick}
                      formatDate={formatDate}
                      getRatingColor={getRatingColor}
                    />
                  ) : (
                    <EmptyState 
                      status="active" 
                      category={categoryFilter} 
                      search={searchQuery}
                      onReset={() => {
                        setCategoryFilter('all');
                        setSearchQuery('');
                      }}
                    />
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {filteredServices.length > 0 ? (
                    <ServicesList 
                      services={filteredServices} 
                      viewMode={viewMode} 
                      onToggleStatus={toggleServiceStatus}
                      onDeleteClick={handleDeleteClick}
                      formatDate={formatDate}
                      getRatingColor={getRatingColor}
                    />
                  ) : (
                    <EmptyState 
                      status="inactive" 
                      category={categoryFilter} 
                      search={searchQuery}
                      onReset={() => {
                        setCategoryFilter('all');
                        setSearchQuery('');
                      }}
                    />
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </div>
          </Tab.Group>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && selectedService && (
            <Dialog
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
              open={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
            >
              <div className="flex items-center justify-center min-h-screen p-4">
                <Dialog.Overlay 
                  as={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" 
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl transform max-w-lg w-full m-4 z-10 relative"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <FiAlertCircle className="h-6 w-6" />
                      </div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Supprimer le service
                      </Dialog.Title>
                    </div>
                    
                    <Dialog.Description className="text-gray-600 mb-6">
                      Êtes-vous sûr de vouloir supprimer <span className="font-medium">"{selectedService.title}"</span>? Cette action est irréversible et toutes les données associées seront définitivement perdues.
                    </Dialog.Description>
                    
                    {selectedService.orderCount > 0 && (
                      <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-6 flex items-start">
                        <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          Ce service a <span className="font-semibold">{selectedService.orderCount} commandes</span> associées. La suppression n'affectera pas les commandes existantes, mais le service ne sera plus disponible pour de nouvelles commandes.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        onClick={() => setIsDeleteModalOpen(false)}
                      >
                        Annuler
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
                        onClick={confirmDelete}
                      >
                        Confirmer la suppression
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

// List component - renders services in either grid or list mode
type ServicesListProps = {
  services: Service[];
  viewMode: 'grid' | 'list';
  onToggleStatus: (id: string) => void;
  onDeleteClick: (service: Service) => void;
  formatDate: (date: string) => string;
  getRatingColor: (rating: number) => string;
};

const ServicesList = ({ services, viewMode, onToggleStatus, onDeleteClick, formatDate, getRatingColor }: ServicesListProps) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (viewMode === 'grid') {
    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {services.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service}
            onToggleStatus={onToggleStatus}
            onDeleteClick={onDeleteClick}
            formatDate={formatDate}
            getRatingColor={getRatingColor}
            variants={itemVariants}
          />
        ))}
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {services.map((service) => (
        <ServiceListItem 
          key={service.id} 
          service={service}
          onToggleStatus={onToggleStatus}
          onDeleteClick={onDeleteClick}
          formatDate={formatDate}
          getRatingColor={getRatingColor}
          variants={itemVariants}
        />
      ))}
    </motion.div>
  );
};

// List view component
const ServiceListItem = ({ service, onToggleStatus, onDeleteClick, formatDate, getRatingColor, variants }: { 
  service: Service; 
  onToggleStatus: (id: string) => void;
  onDeleteClick: (service: Service) => void;
  formatDate: (date: string) => string;
  getRatingColor: (rating: number) => string;
  variants: any;
}) => {
  return (
    <motion.div 
      variants={variants}
      className={`bg-white rounded-xl shadow-sm border ${
        service.isActive ? 'border-gray-100' : 'border-gray-200'
      } overflow-hidden hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image column */}
        <div className="w-full sm:w-48 lg:w-56">
          <div className="aspect-w-16 aspect-h-9 sm:h-full bg-gray-100 relative">
            {service.images && service.images.length > 0 ? (
              <img 
                src={service.images[0]} 
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x400/6366f1/ffffff?text=${encodeURIComponent(service.title.substring(0, 20))}`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-500">
                <FiUser className="h-10 w-10" />
              </div>
            )}
            
            {/* Status badge */}
            <div className="absolute top-3 right-3 z-10">
              {service.isActive ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                  Actif
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm backdrop-blur-sm">
                  <FiEyeOff className="mr-1.5 h-3 w-3" />
                  Inactif
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Content column */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-indigo-700 transition-colors">
                <Link href={`/dashboard/services/${service.id}`}>
                  {service.title}
                </Link>
              </h3>
              
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <div className="flex items-center mr-3">
                  <FiCalendar className="h-3.5 w-3.5 mr-1" />
                  {formatDate(service.createdAt)}
                </div>
                <div className="flex items-center mr-3">
                  <FiClock className="h-3.5 w-3.5 mr-1" />
                  <span>Livraison: {service.deliveryTime}j</span>
                </div>
                {service.category && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {service.category.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`flex items-center ${getRatingColor(service.rating)} px-2 py-0.5 rounded text-xs font-medium border`}>
                <FiStar className="h-3.5 w-3.5 mr-1 fill-current" />
                <span>{service.rating.toFixed(1)}</span>
                <span className="text-xs ml-1 opacity-80">({service.totalReviews})</span>
              </div>
              
              <div className="flex items-center text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded">
                <FiShoppingBag className="h-3.5 w-3.5 mr-1" />
                <span>{service.orderCount}</span>
              </div>
            </div>
          </div>
          
          {/* Description if available */}
          {service.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {service.description}
            </p>
          )}
          
          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 mt-auto">
              {service.tags.map((tag, idx) => (
                <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-900 flex items-center">
              <FiDollarSign className="h-4 w-4 mr-1 text-green-600" />
              {service.price.toLocaleString()} FCFA
            </span>
            
            <div className="flex bg-gray-50 p-1 rounded-lg">
              <Tooltip content="Vue publique" position="top">
                <Link
                  href={`/services/${service.slug}`}
                  className="p-1.5 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiExternalLink className="h-4 w-4" />
                </Link>
              </Tooltip>
              <Tooltip content={service.isActive ? 'Désactiver' : 'Activer'} position="top">
                <button
                  onClick={() => onToggleStatus(service.id)}
                  className={`p-1.5 rounded-md ${
                    service.isActive 
                      ? 'text-gray-700 hover:bg-gray-200' 
                      : 'text-green-700 hover:bg-green-100'
                  } transition-colors`}
                >
                  {service.isActive ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </Tooltip>
              <Tooltip content="Modifier" position="top">
                <Link 
                  href={`/dashboard/services/${service.id}/edit`}
                  className="p-1.5 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <FiEdit2 className="h-4 w-4" />
                </Link>
              </Tooltip>
              <Tooltip content="Supprimer" position="top">
                <button
                  onClick={() => onDeleteClick(service)}
                  className="p-1.5 rounded-md text-red-700 hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty state component
const EmptyState = ({ status, category, search, onReset }: { 
  status: string; 
  category: string;
  search: string;
  onReset: () => void;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
    >
      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 mb-6">
          {status !== 'all' || category !== 'all' || search ? (
            <FiFilter className="h-10 w-10" />
          ) : (
            <FiShoppingBag className="h-10 w-10" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{
          status !== 'all' || category !== 'all' || search 
            ? 'Aucun service trouvé' 
            : 'Aucun service créé'
        }</h3>
        
        {status !== 'all' || category !== 'all' || search ? (
          <>
            <p className="text-gray-500 mb-8">
              Nous n'avons trouvé aucun service correspondant à vos critères de recherche actuels.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 w-full">
              <div className="grid grid-cols-1 gap-2 text-sm text-left">
                {status !== 'all' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Statut:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                )}
                
                {category !== 'all' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Catégorie:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category === 'CAT-001' ? 'Design graphique' : 
                       category === 'CAT-002' ? 'UI/UX Design' : 
                       category === 'CAT-003' ? 'Développement web' : category}
                    </span>
                  </div>
                )}
                
                {search && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Recherche:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      "{search}"
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReset}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <FiX className="mr-2 h-4 w-4" />
              Réinitialiser les filtres
            </motion.button>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-8">
              Vous n'avez actuellement aucun service. Créez votre premier service pour commencer à recevoir des commandes.
            </p>
            
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg mb-8 text-left">
              <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                <FiStar className="mr-2 h-4 w-4" />
                Avantages de créer un service
              </h4>
              <ul className="space-y-2 text-sm text-indigo-700">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-2"></span>
                  <span>Exposez vos compétences au public sur NionFar.sn</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-2"></span>
                  <span>Gagnez plus de clients et générez des revenus</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-2"></span>
                  <span>Bâtissez votre réputation via les avis clients</span>
                </li>
              </ul>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/dashboard/services/new"
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Créer un service
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ServicesPage;