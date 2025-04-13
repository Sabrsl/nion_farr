import { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiChevronRight,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiX,
  FiSliders,
  FiRefreshCw,
  FiList,
  FiGrid,
  FiCheck,
  FiInfo,
  FiBookmark,
  FiHeart
} from 'react-icons/fi/index.js';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { FilterSidebar } from '../components/explorer/FilterSidebar';
import { ServiceGrid } from '../components/explorer/ServiceGrid';
import { serviceExplorer } from '../services/serviceExplorerService';
import axios from 'axios';
import { PlaceholdersAndVanishInput } from '../components/ui/placeholders-and-vanish-input';

// Types
import { Category, Service, FilterOptions } from '../types';

// Categories data as fallback
import { categories } from '../data/categories';

// Vérifier si la catégorie d'un service est un objet ou une chaîne de caractères
const getCategoryId = (category: any): string => {
  if (typeof category === 'string') {
    return category;
  }
  return category?.id || '';
};

// Obtenir le nom de la catégorie de manière sécurisée
const getCategoryName = (category: any): string => {
  if (!category) return '';
  if (typeof category === 'string') return '';
  return category.name || '';
};

const Explorer: NextPage = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [statsData, setStatsData] = useState({
    avgRating: 0,
    monthlyOrders: '0',
    avgDelivery: '0 jours',
    avgPrice: '0 FCFA',
    freelancersCount: '0',
    clientsCount: '0',
    totalPayments: '0'
  });

  // Stats memoization pour éviter des recalculs inutiles
  const stats = useMemo(() => {
    return {
      ...statsData,
      totalServices: totalCount || filteredServices.length
    };
  }, [filteredServices.length, totalCount, statsData]);

  // Fetch initial data
  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchStats();
  }, []);

  // Fetch services
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      // Use the new API for fetching services
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
        params: {
          ...filters,
          search: searchQuery,
          category: selectedCategory,
          sort: sortBy
        }
      });

      if (response.data && response.data.services) {
        setServices(response.data.services);
        setFilteredServices(response.data.services);
        setTotalCount(response.data.total || response.data.services.length);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services/categories`);
      if (response.data && response.data.categories) {
        setFeaturedCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to local categories if API fails
      setFeaturedCategories(categories);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      // Récupérer les statistiques des services
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services/stats`);
      
      // Récupérer les statistiques de la plateforme
      let platformStats = {};
      try {
        const platformResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/platform`);
        if (platformResponse.data && platformResponse.data.stats) {
          platformStats = {
            freelancersCount: platformResponse.data.stats.freelancersCount ? 
              `${platformResponse.data.stats.freelancersCount.toLocaleString()}+` : '0',
            clientsCount: platformResponse.data.stats.clientsCount ?
              `${platformResponse.data.stats.clientsCount.toLocaleString()}+` : '0',
            totalPayments: platformResponse.data.stats.payments ? 
              `${Math.round(platformResponse.data.stats.payments / 1000).toLocaleString()}M+ FCFA` : '0 FCFA'
          };
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Fallback pour les stats de plateforme
        platformStats = {
          freelancersCount: '0',
          clientsCount: '0',
          totalPayments: '0 FCFA'
        };
      }
      
      if (response.data && response.data.stats) {
        const { avgRating, monthlyOrders, avgDeliveryTime, avgPrice } = response.data.stats;
        setStatsData({
          avgRating: avgRating || 0,
          monthlyOrders: (monthlyOrders || 0) + '+',
          avgDelivery: `${avgDeliveryTime || 0} jours`,
          avgPrice: `${(avgPrice || 0).toLocaleString()} FCFA`,
          // Utiliser les valeurs de platformStats ou les valeurs par défaut
          freelancersCount: (platformStats as any)?.freelancersCount || '0',
          clientsCount: (platformStats as any)?.clientsCount || '0',
          totalPayments: (platformStats as any)?.totalPayments || '0 FCFA'
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // En cas d'erreur, garder les valeurs par défaut
    }
  };

  // Récupérer le nombre de clients
  const fetchClientsCount = async (): Promise<string> => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/stats/count?role=client`);
      if (response.data && response.data.count) {
        return `${response.data.count.toLocaleString()}+`;
      }
      return '0';
    } catch (error) {
      console.error('Error fetching client count:', error);
      return '0';
    }
  };

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchServices(),
      fetchStats()
    ]);
    setIsRefreshing(false);
  };

  // Apply filters
  useEffect(() => {
    if (services.length > 0) {
      fetchServices(); // Re-fetch when filters change
    }
  }, [filters, sortBy, selectedCategory, searchQuery]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      try {
        // Filtrer d'abord par statut actif
        let filtered = services.filter(service => service.isActive);
        
        // Appliquer les filtres supplémentaires
        // Filter by categories
        if (newFilters.categories && newFilters.categories.length > 0) {
          filtered = filtered.filter(service => {
            const categoryId = getCategoryId(service.category);
            return newFilters.categories!.includes(categoryId);
          });
        }
        
        // Filter by price range
        if (newFilters.minPrice || newFilters.maxPrice) {
          filtered = filtered.filter(service => 
            (!newFilters.minPrice || service.price >= newFilters.minPrice) &&
            (!newFilters.maxPrice || service.price <= newFilters.maxPrice)
          );
        }
        
        // Filter by rating
        if (newFilters.minRating && newFilters.minRating > 0) {
          filtered = filtered.filter(service => (service.rating || 0) >= (newFilters.minRating || 0));
        }
        
        // Apply sorting
        sortServices(filtered);
        
        setFilteredServices(filtered);
      } catch (error) {
        console.error('Erreur lors du filtrage des services:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);
    
    // Nettoyer le timer en cas de démontage ou d'appel multiples rapides
    return () => clearTimeout(timer);
  };

  const sortServices = (services: Service[]) => {
    switch(sortBy) {
      case 'newest':
        return services.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'price-low':
        return services.sort((a, b) => a.price - b.price);
      case 'price-high':
        return services.sort((a, b) => b.price - a.price);
      case 'popular':
      default:
        // Méthode sûre pour accéder à orderCount
        const getOrderCount = (service: Service) => {
          return typeof service === 'object' && 'orderCount' in service ? (service as any).orderCount : 0;
        };
        return services.sort((a, b) => getOrderCount(b) - getOrderCount(a));
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    // Si la catégorie est déjà sélectionnée, on la désactive
    const newCategorySelection = categoryId === selectedCategory ? null : categoryId;
    setSelectedCategory(newCategorySelection);
    
    // Mise à jour des filtres avec la catégorie sélectionnée
    const newFilters = { ...filters };
    if (newCategorySelection) {
      newFilters.categories = [newCategorySelection];
    } else {
      delete newFilters.categories;
    }
    
    handleFilterChange(newFilters);
  };

  const handleSort = (sort: 'popular' | 'newest' | 'price-low' | 'price-high') => {
    setSortBy(sort);
    
    // Re-sort the filtered services
    setIsLoading(true);
    setTimeout(() => {
      const sorted = [...filteredServices];
      sortServices(sorted);
      setFilteredServices(sorted);
      setIsLoading(false);
    }, 300);
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('popular');
    
    // Reset to original services
    setIsLoading(true);
    setTimeout(() => {
      setFilteredServices(services);
      setIsLoading(false);
    }, 300);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Layout 
      title="Explorer les services | NionFar.sn"
      description="Découvrez des milliers de services proposés par les meilleurs freelances sénégalais sur NionFar.sn"
    >
      {/* Hero Section - Modernisé */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-12 lg:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto pt-8 md:pt-12"
          >
            <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium bg-white/20 rounded-full backdrop-blur-sm mb-4">
              {stats.totalServices > 0 ? `+${stats.totalServices}` : "Des"} services disponibles
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Trouvez le service idéal
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Des milliers de freelances talentueux prêts à réaliser vos projets
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <PlaceholdersAndVanishInput
                variant="hero"
                placeholders={[
                  "Développement web",
                  "Design graphique",
                  "Marketing digital",
                  "Rédaction web",
                  "Traduction",
                ]}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(e);
                }}
              />
            </div>
          </motion.div>

          {/* Featured categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4"
          >
            {featuredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={`bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all cursor-pointer border ${
                  selectedCategory === category.id 
                    ? 'border-white ring-2 ring-white/50' 
                    : 'border-white/20'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center mb-1 sm:mb-2">
                  <span className="text-lg sm:text-xl mr-2 sm:mr-3">{category.icon}</span>
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold truncate">{category.name}</h3>
                </div>
                <p className="text-xs sm:text-sm text-indigo-100">{category.count}+ services</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section - Version améliorée */}
      <section className="bg-white shadow-sm py-4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              } transition-all duration-200`}
            >
              Tous
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                } transition-all duration-200`}
              >
                <span className="mr-1">{category.icon}</span> {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumbs & Stats combined section */}
      <section className="bg-white border-y border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Breadcrumbs */}
            <nav className="flex text-xs sm:text-sm font-medium">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Accueil
              </Link>
              <span className="flex items-center mx-2 text-gray-400">
                <FiChevronRight className="h-4 w-4" />
              </span>
              <Link href="/explorer" className="text-indigo-600 hover:text-indigo-800">
                Explorer
              </Link>
              {selectedCategory && (
                <>
                  <span className="flex items-center mx-2 text-gray-400">
                    <FiChevronRight className="h-4 w-4" />
                  </span>
                  <span className="text-gray-700">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                </>
              )}
            </nav>
            
            {/* Results count & Actions */}
            <div className="flex items-center justify-between md:justify-end space-x-4">
              <span className="text-xs sm:text-sm text-gray-500">
                {stats.totalServices} résultats
              </span>
              
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full disabled:opacity-50"
                title="Actualiser"
              >
                <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vue en grille"
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vue en liste"
                >
                  <FiList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Version desktop uniquement */}
      {/* Suppression de la section des statistiques détaillées */}

      {/* Main content */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <FilterSidebar
              isMobileFilterOpen={isMobileFilterOpen}
              closeMobileFilter={() => setIsMobileFilterOpen(false)}
              onFilterChange={handleFilterChange}
              categories={featuredCategories}
            />

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-6">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiFilter className="h-5 w-5" />
                    <span className="ml-2">Filtres</span>
                  </button>
                  <button
                    onClick={refreshData}
                    className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isRefreshing}
                  >
                    <FiRefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="ml-2 hidden sm:inline">Actualiser</span>
                  </button>
                </div>
              </div>

              {/* Service Grid */}
              <ServiceGrid
                services={filteredServices}
                isLoading={isLoading}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section - Modern Version */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="absolute inset-0 opacity-10 bg-[url('/img/grid-pattern.svg')] bg-center"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-white/30">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium bg-white/20 text-white rounded-full backdrop-blur-sm mb-4">
                Pour les freelances
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                Proposez vos services sur NionFar
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Rejoignez notre communauté de freelances et développez votre activité en proposant vos compétences à des milliers de clients potentiels.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/devenir-freelance"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-indigo-600 font-medium hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 w-full sm:w-auto"
                >
                  Devenir freelance <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  href="/comment-ca-marche"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-transparent text-white border border-white font-medium hover:bg-white/10 transition-all w-full sm:w-auto"
                >
                  Comment ça marche
                </Link>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-white">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{stats.freelancersCount}</div>
                <p className="text-xs sm:text-sm md:text-base text-indigo-100">Freelances actifs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{stats.clientsCount}</div>
                <p className="text-xs sm:text-sm md:text-base text-indigo-100">Clients satisfaits</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{stats.totalPayments}</div>
                <p className="text-xs sm:text-sm md:text-base text-indigo-100">FCFA distribués</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular searches */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Recherches populaires</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les services les plus recherchés sur NionFar
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {['Logo design', 'Rédaction web', 'Développement web', 'Community management', 'Traduction', 'Marketing digital', 'Montage vidéo', 'Photographie', 'Consulting', 'SEO'].map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch({ preventDefault: () => {} } as React.FormEvent);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Explorer;