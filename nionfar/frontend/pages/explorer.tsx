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
} from 'react-icons/fi';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { FilterSidebar } from '../components/explorer/FilterSidebar';
import { ServiceGrid } from '../components/explorer/ServiceGrid';
import { serviceExplorerService } from '../services/serviceExplorerService';

// Types
import { Category, Service, FilterOptions } from '../types';

// Mock data for development
import { categories } from '../data/categories';
import { mockServices } from '../data/services';

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

  // Stats memoization pour éviter des recalculs inutiles
  const stats = useMemo(() => {
    return {
      avgRating: 4.8,
      monthlyOrders: '2500+',
      avgDelivery: '3 jours',
      avgPrice: '22 000 FCFA',
      totalServices: filteredServices.length
    };
  }, [filteredServices.length]);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        // En production, utiliser serviceExplorerService.getAllPublicServices()
        // Pour la démo, filtrer les services mock
        const publicServices = mockServices.filter(service => service.isActive);
        
        // Vérifiez si le composant est toujours monté avant de mettre à jour l'état
        if (isMounted) {
          setServices(publicServices);
          setFilteredServices(publicServices);
          setFeaturedCategories(categories.slice(0, 4));
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des services:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchServices();
    
    // Nettoyer pour éviter les mises à jour d'état sur un composant démonté
    return () => {
      isMounted = false;
    };
  }, []); // Dépendance vide = s'exécute uniquement au montage

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation de la recherche
    setIsLoading(true);
    setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredServices(services);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = services.filter(service => {
          const categoryName = getCategoryName(service.category);
            
          return service.title.toLowerCase().includes(query) || 
            (service.description?.toLowerCase() || '').includes(query) ||
            categoryName.toLowerCase().includes(query);
        });
        setFilteredServices(filtered);
      }
      setIsLoading(false);
    }, 500);
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

  const refreshData = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    
    // Simulation d'un rafraîchissement des données
    setTimeout(() => {
      setIsRefreshing(false);
      setIsLoading(false);
    }, 1000);
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
            <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 rounded-full backdrop-blur-sm mb-4">
              +10 000 services disponibles
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Trouvez le service idéal
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Des milliers de freelances talentueux prêts à réaliser vos projets
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-24 py-4 rounded-full shadow-xl border-0 text-gray-900 focus:ring-2 focus:ring-indigo-500 text-lg"
                placeholder="Que recherchez-vous ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-[105px] top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-medium shadow-md"
              >
                Rechercher
              </button>
            </form>
          </motion.div>

          {/* Featured categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {featuredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer border ${
                  selectedCategory === category.id 
                    ? 'border-white ring-2 ring-white/50' 
                    : 'border-white/20'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
                <p className="text-sm text-indigo-100">{category.count}+ services</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,149.3C672,160,768,160,864,138.7C960,117,1056,75,1152,69.3C1248,64,1344,96,1392,112L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Categories Section - Version améliorée */}
      <section className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
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
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
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
            <nav className="flex text-sm font-medium">
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
              <span className="text-sm text-gray-500">
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
      <section className="bg-gray-50 border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-4 gap-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg mr-3 text-white shadow-md">
                <FiStar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Note moyenne</p>
                <p className="text-lg font-bold text-gray-900">{stats.avgRating}/5</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg mr-3 text-white shadow-md">
                <FiTrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="text-lg font-bold text-gray-900">{stats.monthlyOrders} ce mois</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg mr-3 text-white shadow-md">
                <FiCalendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Délai moyen</p>
                <p className="text-lg font-bold text-gray-900">{stats.avgDelivery}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg mr-3 text-white shadow-md">
                <FiDollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prix moyen</p>
                <p className="text-lg font-bold text-gray-900">{stats.avgPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="bg-gray-50 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sort & Filter controls - Mobile */}
          <div className="lg:hidden mb-6 flex items-center space-x-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <FiSliders className="w-5 h-5 mr-2" />
              <span>Filtres</span>
            </button>
            
            <div className="relative inline-block text-left flex-1">
              <button
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                onClick={() => document.getElementById('sort-dropdown')?.classList.toggle('hidden')}
              >
                <FiFilter className="w-5 h-5 mr-2" />
                <span>Trier par</span>
              </button>
              <div id="sort-dropdown" className="hidden absolute right-0 w-48 mt-2 bg-white shadow-lg rounded-lg z-20 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => handleSort('popular')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    {sortBy === 'popular' && <FiCheck className="h-4 w-4 mr-2 text-indigo-600" />}
                    <span className={sortBy === 'popular' ? 'text-indigo-600 font-medium ml-6' : 'ml-6'}>Popularité</span>
                  </button>
                  <button
                    onClick={() => handleSort('newest')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    {sortBy === 'newest' && <FiCheck className="h-4 w-4 mr-2 text-indigo-600" />}
                    <span className={sortBy === 'newest' ? 'text-indigo-600 font-medium ml-6' : 'ml-6'}>Plus récent</span>
                  </button>
                  <button
                    onClick={() => handleSort('price-low')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    {sortBy === 'price-low' && <FiCheck className="h-4 w-4 mr-2 text-indigo-600" />}
                    <span className={sortBy === 'price-low' ? 'text-indigo-600 font-medium ml-6' : 'ml-6'}>Prix croissant</span>
                  </button>
                  <button
                    onClick={() => handleSort('price-high')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    {sortBy === 'price-high' && <FiCheck className="h-4 w-4 mr-2 text-indigo-600" />}
                    <span className={sortBy === 'price-high' ? 'text-indigo-600 font-medium ml-6' : 'ml-6'}>Prix décroissant</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Filter Sidebar - Amélioré */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-20">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Réinitialiser
                  </button>
                </div>
                
                {/* Contenu du sidebar - ici on pourrait intégrer le composant FilterSidebar */}
                <div className="p-4">
                  <FilterSidebar
                    isMobileFilterOpen={isMobileFilterOpen}
                    closeMobileFilter={() => setIsMobileFilterOpen(false)}
                    onFilterChange={handleFilterChange}
                    categories={categories}
                  />
                </div>
                
                {/* Sort controls - Desktop */}
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Trier par</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSort('popular')}
                      className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${
                        sortBy === 'popular' 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FiTrendingUp className="h-4 w-4 mr-2" />
                      Popularité
                    </button>
                    <button
                      onClick={() => handleSort('newest')}
                      className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${
                        sortBy === 'newest' 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FiCalendar className="h-4 w-4 mr-2" />
                      Plus récent
                    </button>
                    <button
                      onClick={() => handleSort('price-low')}
                      className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${
                        sortBy === 'price-low' 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FiDollarSign className="h-4 w-4 mr-2" />
                      Prix croissant
                    </button>
                    <button
                      onClick={() => handleSort('price-high')}
                      className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${
                        sortBy === 'price-high' 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FiDollarSign className="h-4 w-4 mr-2" />
                      Prix décroissant
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Services Grid - Enhanced */}
            <div className="flex-1">
              {/* Active filters */}
              {(selectedCategory || Object.keys(filters).length > 0) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-700 mr-2">Filtres actifs:</span>
                    
                    {selectedCategory && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        {categories.find(c => c.id === selectedCategory)?.name}
                        <button 
                          onClick={() => handleCategoryClick(selectedCategory)}
                          className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                        >
                          <FiX className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    
                    {filters.minPrice && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Prix min: {filters.minPrice} FCFA
                        <button 
                          onClick={() => handleFilterChange({...filters, minPrice: 0})}
                          className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                        >
                          <FiX className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    
                    {filters.maxPrice && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Prix max: {filters.maxPrice} FCFA
                        <button 
                          onClick={() => handleFilterChange({...filters, maxPrice: undefined})}
                          className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                        >
                          <FiX className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    
                    {filters.minRating && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Note min: {filters.minRating}
                        <button 
                          onClick={() => handleFilterChange({...filters, minRating: 0})}
                          className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                        >
                          <FiX className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    
                    <button 
                      onClick={clearFilters}
                      className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                </div>
              )}
              
              {/* Services Grid */}
              <ServiceGrid 
                services={filteredServices} 
                isLoading={isLoading} 
                viewMode={viewMode}
              />
              
              {/* Empty state */}
              {!isLoading && filteredServices.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <FiInfo className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    Aucun service ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
              
              {/* Pagination */}
              {!isLoading && filteredServices.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Précédent</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      aria-current="page"
                      className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      2
                    </a>
                    <a
                      href="#"
                      className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium"
                    >
                      3
                    </a>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <a
                      href="#"
                      className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium"
                    >
                      8
                    </a>
                    <a
                      href="#"
                      className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      9
                    </a>
                    <a
                      href="#"
                      className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      10
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Suivant</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
              <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm mb-4">
                Pour les freelances
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Proposez vos services sur NionFar
              </h2>
              <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
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
                <div className="text-3xl font-bold mb-1">10K+</div>
                <p className="text-indigo-100">Freelances actifs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">25K+</div>
                <p className="text-indigo-100">Clients satisfaits</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">450M+</div>
                <p className="text-indigo-100">FCFA distribués</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular searches */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recherches populaires</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
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