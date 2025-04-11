import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiSlash, FiRotateCw, FiSearch, FiFilter, FiSend, FiUser, FiMail, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi/index.js';
import { HiOutlineDocumentReport } from 'react-icons/hi/index.js';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Service, User } from '../../types';
import { serviceValidationBot, ValidationResult } from '../../utils/serviceValidation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ServiceValidationTable, { ServiceStatus } from '../../components/admin/ServiceValidationTable';
import ServiceValidationDetails from '../../components/admin/ServiceValidationDetails';
import ServiceValidationFilters from '../../components/admin/ServiceValidationFilters';
import serviceValidationService from '../../services/serviceValidationService';

// Type pour étendre les providers avec des propriétés supplémentaires
type ExtendedProvider = Service['provider'] & {
  isVerified?: boolean;
  emailVerified?: boolean;
  bio?: string;
  skills?: string[];
  location?: string;
  email?: string;
  role?: 'client' | 'freelance' | 'provider' | 'admin';
};

// Helper pour convertir un ExtendedProvider en User pour la validation
const providerToUser = (provider: ExtendedProvider): User => {
  return {
    id: provider.id,
    name: provider.name,
    email: provider.email || `${provider.id}@example.com`, // Email par défaut
    role: provider.role || 'provider', // Role par défaut
    avatar: provider.avatar,
    isVerified: provider.isVerified,
    emailVerified: provider.emailVerified,
    bio: provider.bio,
    skills: provider.skills,
    location: provider.location
  };
};

// Mock data for demo purposes
const mockServices: Service[] = [
  {
    id: '1',
    title: 'Website Development Services - Professional & Responsive Design',
    description: 'I will create a professional and responsive website for your business, portfolio, or e-commerce store. My services include:\n\n- Custom design tailored to your brand\n- Mobile-friendly responsive layout\n- SEO optimization\n- Contact forms and social media integration\n- Up to 5 pages of content\n\nWith over 5 years of experience in web development, I guarantee high-quality work delivered on time. I use the latest technologies including HTML5, CSS3, JavaScript, and React to ensure your website is modern and performs well.',
    price: 75000,
    isActive: true,
    category: { id: 'web', name: 'Web Development' },
    provider: {
      id: 'p1',
      name: 'John Doe',
      avatar: '/images/avatar-1.jpg',
      isVerified: true,
      emailVerified: true,
      bio: 'Professional web developer with over 5 years of experience in creating beautiful, functional websites for businesses of all sizes.',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      location: 'Dakar, Senegal',
      email: 'john.doe@example.com',
      role: 'provider'
    } as ExtendedProvider,
    images: ['/images/website-dev-1.jpg', '/images/website-dev-2.jpg'],
    tags: ['website', 'web development', 'responsive design', 'frontend', 'react'],
    createdAt: '2023-10-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Logo Design - Modern & Minimalist',
    description: 'I will design a modern and minimalist logo for your brand.',
    price: 25000,
    isActive: true,
    category: { id: 'design', name: 'Graphic Design' },
    provider: {
      id: 'p2',
      name: 'Jane Smith',
      avatar: '/images/avatar-2.jpg',
      isVerified: false,
      emailVerified: true,
    } as ExtendedProvider,
    image: '/images/logo-design.jpg',
    tags: ['logo', 'design', 'branding'],
    createdAt: '2023-10-12T14:20:00Z'
  },
  {
    id: '3',
    title: 'Social Media Management - Grow Your Audience',
    description: 'Contact me on WhatsApp at +123456789 for social media management services. I will help you grow your followers and engagement.',
    price: 35000,
    isActive: false,
    category: { id: 'marketing', name: 'Digital Marketing' },
    provider: {
      id: 'p3',
      name: 'Mike Johnson',
      avatar: '/images/avatar-3.jpg'
    },
    images: ['/images/social-media-1.jpg'],
    tags: ['social media', 'marketing', 'instagram', 'facebook'],
    createdAt: '2023-10-08T09:15:00Z'
  },
  {
    id: '4',
    title: 'Professional Content Writing Services',
    description: 'I will write high-quality, SEO-optimized content for your website, blog, or social media. My content writing services include:\n\n- Blog posts and articles\n- Website copy\n- Product descriptions\n- Social media content\n- Email newsletters\n\nAll content is thoroughly researched, well-structured, and written to engage your target audience while helping you rank better in search engines.',
    price: 20000,
    isActive: true,
    category: { id: 'writing', name: 'Content Writing' },
    provider: {
      id: 'p4',
      name: 'Emily Davis',
      avatar: '/images/avatar-4.jpg',
      isVerified: true,
      emailVerified: true,
      bio: 'Professional content writer specializing in SEO-friendly blog posts, articles, and website copy.',
      skills: ['Content Writing', 'SEO', 'Copywriting'],
      location: 'Abidjan, Côte d\'Ivoire'
    } as ExtendedProvider,
    images: ['/images/content-writing-1.jpg', '/images/content-writing-2.jpg'],
    tags: ['content writing', 'blog posts', 'SEO', 'copywriting'],
    createdAt: '2023-10-05T11:45:00Z'
  },
  {
    id: '5',
    title: 'Custom diplômes and certificates - Get your documents fast',
    description: 'I will create custom diplomas and certificates for you. Fast delivery and high quality guaranteed.',
    price: 100000,
    isActive: true,
    category: { id: 'design', name: 'Graphic Design' },
    provider: {
      id: 'p5',
      name: 'David Wilson',
      avatar: '/images/avatar-5.jpg'
    },
    image: '/images/certificates.jpg',
    tags: ['certificates', 'diplomas', 'design'],
    createdAt: '2023-09-28T16:30:00Z'
  }
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(price);
};

const ServiceValidationPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState<Record<string, string>>({});
  const [isServiceDetailsModalOpen, setIsServiceDetailsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Détecter la taille de l'écran côté client uniquement
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Récupération des données de services à valider
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Utiliser notre service pour récupérer les services en attente de validation
        const filters = {
          search: searchTerm,
          category: selectedCategory,
          status: selectedStatus,
          sortBy: 'createdAt',
          sortDirection: 'asc' as 'asc' | 'desc'
        };
        
        const result = await serviceValidationService.getPendingServices(filters);
        
        setServices(result.services);
        setFilteredServices(result.services);
        setTotalCount(result.total);
        
        // Récupérer les résultats de validation pour chaque service
        const validationResultsMap: Record<string, ValidationResult> = {};
        
        await Promise.all(
          result.services.map(async (service) => {
            try {
              const validationDetail = await serviceValidationService.getServiceWithValidationDetails(service.id);
              if (validationDetail.validationResult) {
                validationResultsMap[service.id] = validationDetail.validationResult;
                
                // Si le statut est en révision, récupérer le feedback
                if (validationDetail.validationResult.status === 'revision' && 
                    validationDetail.validationResult.revisionFeedback) {
                  setRevisionFeedback(prev => ({
                    ...prev,
                    [service.id]: validationDetail.validationResult.revisionFeedback || ''
                  }));
                }
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération des détails de validation pour ${service.id}:`, error);
            }
          })
        );
        
        setValidationResults(validationResultsMap);
        
        // Sélectionner automatiquement le premier service si disponible
        if (result.services.length > 0 && !selectedService) {
          setSelectedService(result.services[0].id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedCategory, selectedStatus]);
  
  // Filter services when search or filters change
  useEffect(() => {
    // This is now handled by the service in the fetch data useEffect
  }, [services, searchTerm, selectedCategory, selectedStatus, validationResults]);
  
  // Get unique categories for filter
  const categories = Array.from(
    new Set(
      services
        .filter(service => service.category && typeof service.category !== 'string')
        .map(service => {
          if (typeof service.category !== 'string') {
            return { id: service.category?.id, name: service.category?.name };
          }
          return null;
        })
        .filter(Boolean)
    )
  );

  // Lancer une validation
  const runValidation = async (serviceId: string) => {
    setIsAnalyzing(serviceId);
    
    try {
      // Appeler le service pour exécuter l'analyse
      const result = await serviceValidationService.runServiceValidation(serviceId);
      
      // Mettre à jour les résultats de validation dans l'état local
      setValidationResults(prev => ({
        ...prev,
        [serviceId]: result
      }));
      
      console.log(`Service ${serviceId} analysé avec succès`);
    } catch (error) {
      console.error(`Erreur lors de l'analyse du service ${serviceId}:`, error);
    } finally {
      setIsAnalyzing(null);
    }
  };

  // Mettre à jour l'état actif du service
  const updateServiceAvailability = (serviceId: string, makeActive: boolean) => {
    setServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: makeActive }
          : service
      )
    );
  };

  // Mettre à jour le statut de validation
  const updateServiceStatus = async (serviceId: string, status: ServiceStatus) => {
    try {
      // Appeler le service pour mettre à jour le statut
      const result = await serviceValidationService.updateServiceValidationStatus(serviceId, status);
      
      if (result.success) {
        // Mettre à jour le statut dans les résultats de validation locaux
        setValidationResults(prev => ({
          ...prev,
          [serviceId]: {
            ...prev[serviceId],
            status
          }
        }));
        
        // Si le statut est rejeté ou mis en production, mettre à jour l'état actif du service
        if (status === 'rejected') {
          updateServiceAvailability(serviceId, false);
        } else if (status === 'validated_prod') {
          updateServiceAvailability(serviceId, true);
        }
        
        console.log(`Service ${serviceId} status updated to ${status}`);
      } else {
        console.error(`Échec de la mise à jour du statut pour ${serviceId}: ${result.message}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut pour ${serviceId}:`, error);
    }
  };

  // Envoyer une demande de révision
  const sendForRevision = async (serviceId: string, feedback: string) => {
    if (!feedback.trim()) {
      console.error("Le feedback est requis pour demander une révision");
      return;
    }
    
    try {
      // Appeler le service pour envoyer la demande de révision
      const result = await serviceValidationService.sendServiceForRevision(serviceId, feedback);
      
      if (result.success) {
        // Mettre à jour le statut et enregistrer le feedback localement
        setValidationResults(prev => ({
          ...prev,
          [serviceId]: {
            ...prev[serviceId],
            status: 'revision',
            revisionFeedback: feedback
          }
        }));
        
        setRevisionFeedback(prev => ({
          ...prev,
          [serviceId]: feedback
        }));
        
        console.log(`Demande de révision envoyée pour le service ${serviceId}`);
      } else {
        console.error(`Échec de l'envoi de la demande de révision: ${result.message}`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'envoi de la demande de révision pour ${serviceId}:`, error);
    }
  };

  // Mettre en production
  const publishServiceToProd = async (serviceId: string) => {
    try {
      // Appeler le service pour publier en production
      const result = await serviceValidationService.publishServiceToProd(serviceId);
      
      if (result.success) {
        // Mettre à jour le statut et activer le service localement
        updateServiceStatus(serviceId, 'validated_prod');
        updateServiceAvailability(serviceId, true);
        
        console.log(`Service ${serviceId} published to production`);
      } else {
        console.error(`Échec de la mise en production: ${result.message}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la mise en production du service ${serviceId}:`, error);
    }
  };

  // Ouvrir les détails d'un service
  const openServiceDetails = (serviceId: string) => {
    console.log("Service sélectionné:", serviceId);
    setSelectedService(serviceId);
    
    // Sur mobile, ouvrir le modal automatiquement
    if (isMobile) {
      setIsServiceDetailsModalOpen(true);
    }
  };

  // Fermer les détails du service
  const closeServiceDetails = () => {
    // Ne pas désélectionner le service si on ferme juste le modal
    setIsServiceDetailsModalOpen(false);
  };
  
  // Désélectionner le service
  const deselectService = () => {
    setSelectedService(null);
  };

  // Service sélectionné pour affichage dans le panel de détails
  const selectedServiceObject = services.find(s => s.id === selectedService) || null;
  const selectedValidationResult = selectedService ? validationResults[selectedService] || null : null;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Validation des services
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Validez les nouveaux services avant qu'ils ne soient publiés sur la plateforme
            </p>
          </div>
          
          {selectedService && (
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={deselectService}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Retour à la liste
              </button>
              
              <button
                onClick={() => setIsServiceDetailsModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 md:hidden"
              >
                Voir détails
              </button>
            </div>
          )}
        </div>

        {/* Filtres */}
        <ServiceValidationFilters
          onSearchChange={setSearchTerm}
          onStatusChange={setSelectedStatus}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          totalServices={services.length}
          filteredServicesCount={filteredServices.length}
        />

        {/* Affichage conditionnel : tableau ou détails */}
        <div className="grid grid-cols-1 gap-6">
          {/* Tableau des services - toujours visible en pleine largeur */}
          <div className="col-span-1">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prestataire
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => {
                          const result = validationResults[service.id] || {
                            status: 'pending',
                            score: 0,
                            moderatedByBot: false
                          };
                          
                          return (
                            <tr key={service.id} className={`${selectedService === service.id ? 'bg-blue-50' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-md object-cover"
                                      src={service.image || service.images?.[0] || '/images/placeholder.jpg'}
                                      alt={service.title}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                      {service.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {service.createdAt ? formatDate(service.createdAt) : 'N/A'} · {formatPrice(service.price)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <img
                                      className="h-8 w-8 rounded-full object-cover"
                                      src={(service.provider as any)?.avatar || '/images/placeholder-avatar.jpg'}
                                      alt={(service.provider as any)?.name || 'Unknown'}
                                    />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {(service.provider as any)?.name || 'Unknown'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  result.status === 'validated_prod' ? 'bg-emerald-100 text-emerald-800' : 
                                  result.status === 'validated' ? 'bg-green-100 text-green-800' : 
                                  result.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  result.status === 'revision' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {/* Status label content */}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {result.score}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {/* Actions content */}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            Aucun service trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ServiceValidationPage;