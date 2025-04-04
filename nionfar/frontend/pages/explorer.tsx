import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiChevronRight,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiStar
} from 'react-icons/fi';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { FilterSidebar } from '../components/explorer/FilterSidebar';
import { ServiceGrid } from '../components/explorer/ServiceGrid';

// Types
import { Category, Service, FilterOptions } from '../types';

// Mock data for development
import { categories } from '../data/categories';
import { mockServices } from '../data/services';

const Explorer: NextPage = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setServices(mockServices);
      setFilteredServices(mockServices);
      setFeaturedCategories(categories.slice(0, 4));
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // In a real app, you would filter services based on these filters
    // For now, we're just simulating this behavior
    setIsLoading(true);
    setTimeout(() => {
      // Apply filters to services (simplified example)
      let filtered = [...services];
      
      // Filter by categories
      if (newFilters.categories && newFilters.categories.length > 0) {
        filtered = filtered.filter(service => 
          service.category && newFilters.categories!.includes(service.category.id)
        );
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
        filtered = filtered.filter(service => service.rating >= newFilters.minRating!);
      }
      
      setFilteredServices(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    // In a real app, you would filter services based on the selected category
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would search services based on the search query
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Layout 
      title="Explorer les services | NionFar.sn"
      description="Découvrez des milliers de services proposés par les meilleurs freelances sénégalais sur NionFar.sn"
    >
      {/* Hero Section */}
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
            className="text-center max-w-3xl mx-auto pt-16 md:pt-24"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Explorer les services
            </h1>
            <p className="text-lg text-indigo-100 mb-8">
              Trouvez des services de qualité proposés par des freelances talentueux
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 rounded-full shadow-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Que recherchez-vous ? (ex: logo, site web, traduction...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
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
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{category.icon}</span>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
                <p className="text-sm text-indigo-100">{category.count}+ services</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-4">
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

      {/* Breadcrumbs */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-4 border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <FiStar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Services notés</p>
                <p className="text-lg font-bold text-gray-900">4.8/5</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <FiTrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="text-lg font-bold text-gray-900">+2500 ce mois</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <FiCalendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Délai moyen</p>
                <p className="text-lg font-bold text-gray-900">3 jours</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <FiDollarSign className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prix moyen</p>
                <p className="text-lg font-bold text-gray-900">22 000 FCFA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="bg-gray-50 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Filter Sidebar - Mobile trigger button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <FiFilter className="w-5 h-5 mr-2" />
                <span>Filtres</span>
              </button>
            </div>

            {/* Filter Sidebar */}
            <FilterSidebar
              isMobileFilterOpen={isMobileFilterOpen}
              closeMobileFilter={() => setIsMobileFilterOpen(false)}
              onFilterChange={handleFilterChange}
              categories={categories}
            />
            
            {/* Services Grid */}
            <div className="flex-1">
              <ServiceGrid 
                services={filteredServices} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Call to action section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            Vous êtes un freelance talentueux ?
          </h2>
          <p className="text-base sm:text-lg text-indigo-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Rejoignez notre plateforme et proposez vos services à des milliers de clients potentiels.
            Créez votre profil gratuitement et commencez à recevoir des commandes.
          </p>
          <Link
            href="/devenir-freelance"
            className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-white text-indigo-600 font-medium hover:shadow-lg hover:bg-gray-50 transition-all"
          >
            Devenir freelance <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Explorer; 