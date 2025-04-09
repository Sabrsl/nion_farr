import React, { useEffect, useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiStar,
  FiClock,
  FiRepeat,
  FiShoppingBag,
  FiUser,
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiCheckCircle,
  FiArrowLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiX,
  FiPlus,
  FiTrendingUp
} from 'react-icons/fi/index.js';

// Components & Layout
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Rating } from '../../components/ui/Rating';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { ServiceReviews } from '../../components/services/ServiceReviews';
import { ServicePackages } from '../../components/services/ServicePackages';
import { RelatedServices } from '../../components/services/RelatedServices';
import { CommanderButton } from '../../components/services/buttons';

// Services
import { serviceExplorer } from '../../services/serviceExplorerService';
import { useAuth } from '../../contexts/AuthContext';

// Types
import { User } from '../../types';

// Service type spécifique à cette page
interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  images?: string[];
  slug: string;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: string;
  tags?: string[];
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  isFeatured?: boolean;
  deliveryTime?: number;
  revisions?: number;
  provider?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    totalReviews?: number;
    level?: string;
    username?: string;
  };
  createdAt: string;
  updatedAt: string;
  queuedOrders?: number;
}

// Props type
interface ServicePageProps {
  service: Service | null;
  relatedServices: Service[];
  title: string;
}

const ServicePage: NextPage<ServicePageProps> = ({ service, relatedServices, title }) => {
  const router = useRouter();
  const { slug } = router.query;
  
  // Utiliser le hook useAuth directement
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [canOrder, setCanOrder] = useState(false);
  const [cannotOrderReason, setCannotOrderReason] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  // Vérifier si l'utilisateur peut commander le service
  useEffect(() => {
    if (!service) return;
    
    const checkOrderPermission = async () => {
      console.log('[ServicePage] Vérification permission commande:', { 
        serviceId: service.id, 
        isAuthenticated, 
        userId: user?.id,
        isAuthLoading: authLoading
      });
      
      if (!service) {
        setCanOrder(false);
        setCannotOrderReason("Service non disponible");
        return;
      }

      // Si l'utilisateur n'est pas connecté
      if (!isAuthenticated || !user) {
        console.log('[ServicePage] Utilisateur non authentifié');
        setCanOrder(false);
        setCannotOrderReason('Connectez-vous pour commander ce service');
        setIsLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est le créateur du service
      if (service.provider?.id === user.id) {
        console.log('[ServicePage] Utilisateur est le créateur du service');
        setCanOrder(false);
        setCannotOrderReason('Vous ne pouvez pas commander votre propre service');
        setIsLoading(false);
        return;
      }

      // Vérification via le service dédié
      try {
        console.log('[ServicePage] Appel du service de vérification');
        const result = await serviceExplorer.canOrderService(service.id, user.id);
        console.log('[ServicePage] Résultat vérification:', result);
        setCanOrder(result.canOrder);
        setCannotOrderReason(result.canOrder ? null : (result.message ?? null));
      } catch (error) {
        console.error('[ServicePage] Erreur lors de la vérification de commande:', error);
        setCanOrder(false);
        setCannotOrderReason('Une erreur est survenue lors de la vérification');
      }
      setIsLoading(false);
    };

    console.log('[ServicePage] useEffect déclenché pour permissions, authLoading:', authLoading);
    // Seulement vérifier les permissions si l'authentification n'est pas en cours de chargement
    if (!authLoading) {
      setIsLoading(true);
      checkOrderPermission();
    }
  }, [service, user, isAuthenticated, authLoading]);

  // Protéger contre les services indisponibles
  useEffect(() => {
    if (!service) {
      console.log('[ServicePage] Service non trouvé');
      router.push('/404');
      return;
    }
    
    if (!service.isActive) {
      console.log('[ServicePage] Service inactif');
      router.push({
        pathname: '/service-unavailable',
        query: { reason: 'inactive' }
      });
    }
  }, [service, router]);

  // Gérer les images manquantes
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = '/img/placeholder.svg';
  };

  if (!service) {
    return null;
  }

  const shareService = () => {
    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: service.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Lien copié dans le presse-papier !'))
        .catch(console.error);
    }
  };

  const toggleFavorite = () => {
    // For demonstration purposes only
    setIsAddingToFavorites(!isAddingToFavorites);
  };

  return (
    <Layout
      title={`${service.title} | Nionfar`}
      description={service.description || `Service de ${service.provider?.name || 'freelance'} - ${service.title}`}
    >
      <Head>
        {!service.isActive && <meta name="robots" content="noindex" />}
        <title>{`${service.title} | Nionfar`}</title>
        <meta property="og:title" content={`${service.title} | Nionfar`} key="og-title" />
        <meta property="og:description" content={service.description || `Service de ${service.provider?.name || 'freelance'} - ${service.title}`} key="og-description" />
        {service.image && <meta property="og:image" content={service.image} key="og-image" />}
      </Head>
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 text-sm text-gray-500">
            <li>
              <a 
                href="/" 
                className="hover:text-indigo-600 hover:underline"
              >
                Accueil
              </a>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="h-4 w-4 text-gray-400" />
              <a 
                href="/explorer" 
                className="ml-1 hover:text-indigo-600 hover:underline"
              >
                Explorer
              </a>
            </li>
            {service.category && (
              <li className="flex items-center">
                <FiChevronRight className="h-4 w-4 text-gray-400" />
                <a
                  href={`/explorer?category=${service.category.id}`}
                  className="ml-1 hover:text-indigo-600 hover:underline"
                >
                  {service.category.name}
                </a>
              </li>
            )}
            <li className="flex items-center">
              <FiChevronRight className="h-4 w-4 text-gray-400" />
              <span className="ml-1 font-medium text-gray-900 cursor-default">
                {service.title}
              </span>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Colonne gauche: Galerie d'images */}
            <div className="md:w-3/5 md:flex-shrink-0">
              {/* Image principale */}
              <div className="relative aspect-video w-full max-w-4xl mx-auto mb-8">
                <img
                  src={service.image || '/img/placeholder.svg'}
                  alt={service.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                />
              </div>
              
              {/* Miniatures si disponibles */}
              {service.images && service.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50">
                  {service.images.map((img, index) => (
                    <button
                      key={index}
                      className={`relative aspect-square rounded overflow-hidden ${
                        index === activeImageIndex ? 'ring-2 ring-indigo-500' : ''
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={img}
                        alt={`${service.title} - image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Colonne droite: Informations sur le service */}
            <div className="p-6 md:w-2/5">
              {/* Alert banner if service is inactive */}
              {!service.isActive && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FiAlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Service temporairement indisponible</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>Ce service n'est pas accessible pour le moment. Veuillez explorer d'autres services ou revenir plus tard.</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href="/explorer"
                          className="text-sm font-medium text-amber-800 hover:text-amber-600"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = "/explorer";
                          }}
                        >
                          Explorer d'autres services
                          <FiChevronRight className="inline-block ml-1 h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <Rating value={service.rating || 0} readOnly />
                    <span className="text-sm text-gray-500 ml-2">
                      ({service.totalReviews || 0} avis)
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 flex items-center">
                    <FiClock className="mr-1 h-4 w-4" />
                    {service.deliveryTime} jours
                  </div>
                </div>
                
                {/* Prix et bouton d'achat */}
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {service.price.toLocaleString()} FCFA
                    </span>
                    {service.isFeatured && (
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Populaire
                      </span>
                    )}
                  </div>
                  
                  {/* Caractéristiques du service */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center">
                      <FiClock className="h-5 w-5 text-indigo-500 mr-2" />
                      <span className="text-sm">Livraison en {service.deliveryTime} jours</span>
                    </div>
                    <div className="flex items-center">
                      <FiRepeat className="h-5 w-5 text-indigo-500 mr-2" />
                      <span className="text-sm">{service.revisions || 'Illimité'} révisions</span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {service.tags.map((tag, index) => (
                        <a
                          key={index}
                          href={`/explorer?tag=${encodeURIComponent(tag)}`}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium transition-colors"
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="mt-6 space-y-3">
                    {isLoading || authLoading ? (
                      <button 
                        className="flex items-center justify-center w-full px-4 py-3 bg-gray-300 text-gray-600 rounded-md text-sm font-medium shadow-sm cursor-wait"
                        disabled
                      >
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Vérification...
                        </span>
                      </button>
                    ) : (
                      <CommanderButton 
                        serviceId={service.id}
                        sellerId={service.provider?.id || ''}
                        className="py-3 text-sm font-medium shadow-md hover:shadow-lg"
                        data-commander-button
                      />
                    )}
                    
                    {isAuthenticated && !canOrder && cannotOrderReason && !isLoading && (
                      <p className="text-sm text-red-500 text-center">
                        {cannotOrderReason}
                      </p>
                    )}
                    
                    {service.provider && user?.id !== service.provider.id && (
                      <a
                        href={`/services/contact/${service.id}`}
                        className="flex items-center justify-center w-full px-4 py-3 border border-indigo-200 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-sm hover:shadow-md"
                      >
                        <FiMessageCircle className="mr-2 h-5 w-5" />
                        Contacter le vendeur
                      </a>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleFavorite}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiHeart className={`mr-2 h-5 w-5 ${isAddingToFavorites ? 'text-red-500 fill-red-500' : ''}`} />
                        Favoris
                      </button>
                      <button
                        onClick={() => shareService()}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiShare2 className="mr-2 h-5 w-5" />
                        Partager
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Profil du vendeur avec design amélioré */}
                {service.provider && (
                  <div className="p-6 border-t border-gray-200 bg-white">
                    <div className="flex items-center mb-4">
                      <Avatar
                        src={service.provider.avatar}
                        alt={service.provider.name || "Vendeur"}
                        size="md"
                      />
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">
                          {service.provider.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {service.provider.level || 'Freelance'}
                        </p>
                      </div>
                    </div>
                    
                    <a
                      href={`/freelancers/${service.provider.username || service.provider.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="mr-2 h-4 w-4" />
                      Voir le profil
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Onglets avec description, détails, etc. */}
          <div className="border-t border-gray-200 px-6 py-8">
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: 'description', label: 'Description' },
                { id: 'packages', label: 'Options et packages' },
                { id: 'reviews', label: `Avis (${service.totalReviews || 0})` }
              ]}
            />
            
            <div className="mt-6">
              {activeTab === 'description' && (
                <div className="prose prose-indigo max-w-none">
                  <p className="whitespace-pre-line">{service.description}</p>
                </div>
              )}
              
              {activeTab === 'packages' && (
                <div className="prose prose-indigo max-w-none">
                  <p>Options et packages disponibles pour ce service.</p>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="prose prose-indigo max-w-none">
                  <p>Avis des clients sur ce service.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Services similaires */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6">Services similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map(relatedService => (
              <a 
                key={relatedService.id}
                href={`/services/${relatedService.slug}`}
                className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('[ServicePage] Navigating to related service:', relatedService.slug);
                  window.location.href = `/services/${relatedService.slug}`;
                }}
              >
                <div className="relative aspect-video">
                  <img
                    src={relatedService.image || '/img/placeholder.svg'}
                    alt={relatedService.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Éviter les boucles infinies
                      target.src = '/img/placeholder.svg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                    {relatedService.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiStar className="h-4 w-4 text-amber-400 mr-1" /> 
                      {relatedService.rating || '4.5'}
                    </div>
                    <div className="font-semibold text-indigo-600">
                      {relatedService.price.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Image modal */}
      {isImageModalOpen && service.images && service.images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] overflow-hidden">
            <button 
              className="absolute top-2 right-2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
            >
              <FiX className="h-6 w-6" />
            </button>

            <img
              src={service.images && service.images.length > activeImageIndex 
                ? service.images[activeImageIndex] 
                : service.image || '/img/placeholder.svg'}
              alt={`${service.title} - image en plein écran`}
              className="max-h-[85vh] mx-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/img/placeholder.svg';
              }}
            />

            {service.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {service.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === activeImageIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(index);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

// Récupération des données côté serveur
export const getServerSideProps: GetServerSideProps<ServicePageProps> = async (context) => {
  const { slug } = context.params || {};
  
  console.log('[ServicePage][SSR] Récupération du service avec slug:', slug);
  
  if (typeof slug === 'string') {
    try {
      // Récupérer le service depuis l'API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/services/${slug}`);
      
      if (!response.ok) {
        console.log('[ServicePage][SSR] Service non trouvé, redirection vers service-unavailable');
        return {
          redirect: {
            destination: '/service-unavailable?reason=not-found',
            permanent: false,
          },
        };
      }
      
      const data = await response.json();
      const service = data.service;
      
      // Vérifier que le service est actif
      if (!service || !service.isActive) {
        console.log('[ServicePage][SSR] Service inactif ou non trouvé, redirection vers service-unavailable');
        return {
          redirect: {
            destination: '/service-unavailable?reason=inactive',
            permanent: false,
          },
        };
      }
      
      console.log('[ServicePage][SSR] Service trouvé:', !!service);
      
      // Récupérer les services similaires via l'API
      const relatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/services/related?categoryId=${
        typeof service.category === 'object' ? service.category?.id : service.category
      }&exclude=${service.id}&limit=4`);
      
      let relatedServices = [];
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        relatedServices = relatedData.services || [];
      }
      
      console.log('[ServicePage][SSR] Nombre de services liés trouvés:', relatedServices.length);
      
      // Générer le titre de la page pour le passer au niveau de l'application
      const pageTitle = service.title ? `${service.title} - Nionfar` : 'Détail du service - Nionfar';
      
      return {
        props: {
          service,
          relatedServices,
          title: pageTitle // Cette prop sera utilisée par _app.tsx
        }
      };
    } catch (error) {
      console.error('[ServicePage][SSR] Erreur lors de la récupération du service:', error);
      return {
        redirect: {
          destination: '/error',
          permanent: false,
        },
      };
    }
  }
  
  console.log('[ServicePage][SSR] Paramètre slug invalide');
  return {
    redirect: {
      destination: '/services',
      permanent: false,
    },
  };
};

export default ServicePage;