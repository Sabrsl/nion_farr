import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  FiUser
} from 'react-icons/fi';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Service } from '../../../types';
import { freelancerServices } from '../../../data/mockData';

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

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setServices(freelancerServices);
      setFilteredServices(freelancerServices);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filtrer et trier les services lorsque les filtres changent
    let filtered = [...services];
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(service => service.isActive === isActive);
    }
    
    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category && service.category.id === categoryFilter);
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        service => 
          service.title.toLowerCase().includes(query) ||
          (service.description && service.description.toLowerCase().includes(query)) ||
          (service.tags && service.tags.some(tag => tag.toLowerCase().includes(query)))
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
  }, [services, statusFilter, categoryFilter, searchQuery, sortBy]);

  const toggleServiceStatus = (serviceId: string) => {
    // Simuler la mise à jour du statut du service
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
      // Simuler la suppression du service
      setServices(services.filter(service => service.id !== selectedService.id));
      setIsDeleteModalOpen(false);
      setSelectedService(null);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mes Services | NionFar.sn">
        <div className="p-6 sm:p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes Services | NionFar.sn">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Mes Services</h1>
          <Link
            href="/dashboard/services/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Nouveau service
          </Link>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            {/* Filtre par statut */}
            <div className="w-full md:w-1/5">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <div className="relative">
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FiChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Filtre par catégorie */}
            <div className="w-full md:w-1/5">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <div className="relative">
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Toutes</option>
                  <option value="CAT-001">Design graphique</option>
                  <option value="CAT-002">UI/UX Design</option>
                  <option value="CAT-003">Développement web</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FiChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Tri par */}
            <div className="w-full md:w-1/5">
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <div className="relative">
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none block w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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

            {/* Barre de recherche */}
            <div className="w-full md:w-2/5">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Titre, description, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des services */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div 
                key={service.id} 
                className={`bg-white rounded-xl shadow-sm border ${service.isActive ? 'border-gray-100' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-shadow duration-200`}
              >
                {/* Image du service */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                  {service.images && service.images.length > 0 ? (
                    <img 
                      src={service.images[0]} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x400/6366f1/ffffff?text=${encodeURIComponent(service.title.substring(0, 20))}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                      <FiUser className="h-16 w-16" />
                    </div>
                  )}
                  
                  {/* Badge de statut */}
                  <div className="absolute top-2 right-2">
                    {service.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiEye className="mr-1 h-3 w-3" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <FiEyeOff className="mr-1 h-3 w-3" />
                        Inactif
                      </span>
                    )}
                  </div>
                  
                  {/* Catégorie */}
                  {service.category && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                        {service.category.name}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-yellow-500">
                      <FiStar className="h-4 w-4 mr-1 fill-current" />
                      <span className="text-sm font-medium text-gray-800">{service.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500 ml-1">({service.totalReviews} avis)</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FiShoppingBag className="h-4 w-4 mr-1" />
                      <span className="text-xs">{service.orderCount} commandes</span>
                    </div>
                  </div>
                  
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                    {service.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiBarChart2 className="h-4 w-4 mr-1" />
                      {formatDate(service.createdAt)}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <span>Livraison: {service.deliveryTime}j</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-gray-900 flex items-center">
                      <FiDollarSign className="h-4 w-4 mr-1" />
                      {service.price.toLocaleString()} FCFA
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleServiceStatus(service.id)}
                        className={`p-1.5 rounded-full ${
                          service.isActive 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={service.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {service.isActive ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                      <Link 
                        href={`/dashboard/services/${service.id}/edit`}
                        className="p-1.5 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        title="Modifier"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(service)}
                        className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                        title="Supprimer"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Pied de carte avec actions */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <Link
                      href={`/dashboard/services/${service.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Voir détails
                    </Link>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vue publique
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-gray-400 flex flex-col items-center justify-center">
              <FiFilter className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium text-gray-600">Aucun service trouvé</p>
              <p className="text-sm text-gray-500 mt-1">Essayez d'ajuster vos filtres</p>
              
              {statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery ? (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">Vous n'avez actuellement aucun service</p>
                  <Link
                    href="/dashboard/services/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Créer un service
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Supprimer le service
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer le service "{selectedService.title}" ? Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ServicesPage; 