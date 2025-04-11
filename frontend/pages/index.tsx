import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiCheckCircle, 
  FiArrowRight, 
  FiMail, 
  FiStar, 
  FiTrendingUp, 
  FiShield, 
  FiMenu, 
  FiX 
} from 'react-icons/fi/index.js';
import Layout from '../components/layout/Layout';
import { categories } from '../data/categories';
import axios from 'axios';
import TestimonialCard from '../components/ui/TestimonialCard';
import { ContainerTextFlip } from '../components/ui/container-text-flip';
import TrustedPartners from '../components/home/TrustedPartners';
import serviceService from '../services/serviceService';

// Performance monitoring
import { analyzePagePerformance, initPerformanceMonitoring } from '../utils/performance';

// JSON-LD Schemas
import { generateOrganizationSchema, formatJSONLD } from '../utils/schema';

// Chargement différé des composants lourds
import { lazyLoad } from '../utils/lazyLoad';

// Définir les composants à charger en différé
const LazyTrustedPartners = lazyLoad(() => import('../components/home/TrustedPartners').then(mod => ({ default: mod.default || mod })));
const LazyTestimonialCard = lazyLoad(() => import('../components/ui/TestimonialCard').then(mod => ({ default: mod.default || mod })));

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
  image?: string;
  description?: string;
}

interface TopService {
  id: string;
  title: string;
  price: number;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  provider: {
    id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  description: string;
  slug: string;
}

const Home: NextPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoriesWithCount, setCategoriesWithCount] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [isLoadingTopServices, setIsLoadingTopServices] = useState(true);

  // Initialisation du monitoring de performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialiser le monitoring de performance
      initPerformanceMonitoring();
      // Analyser les performances de la page d'accueil
      analyzePagePerformance('/', 'home');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effet pour charger les catégories
  useEffect(() => {
    const fetchCategoriesWithCount = async () => {
      try {
        // Dans une application réelle, vous appelleriez votre API
        // const response = await axios.get('/api/categories');
        // const data = response.data;
        
        setIsLoading(false);
        
        // Simuler des données de catégories
        const data = categories.map(category => ({
              ...category,
          count: Math.floor(Math.random() * 100 + 10)
        }));
          
        setCategoriesWithCount(data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setIsLoading(false);
      }
    };
    
    fetchCategoriesWithCount();
  }, []);

  // Effet pour charger les meilleurs services
  useEffect(() => {
    const fetchTopServices = async () => {
      try {
        setIsLoadingTopServices(true);
        
        // Récupérer les meilleurs services via le service
        const services = await serviceService.getTopServices(4);
        
        // Vérifier que les données sont valides
        if (!services || !Array.isArray(services) || services.length === 0) {
          console.warn('Aucun service top n\'a été récupéré');
          setTopServices([]);
          setIsLoadingTopServices(false);
          return;
        }
        
        // Mapper les services pour obtenir le format attendu par le composant
        const topServicesData = services.map(service => ({
          id: service.id,
          title: service.title,
          price: service.price,
          rating: service.rating,
          totalReviews: service.totalReviews || 0,
          totalOrders: service.totalOrders || 0,
          provider: {
            id: service.provider?.id || '',
            name: service.provider?.name || 'Freelanceur',
            avatar: service.provider?.avatar
          },
          image: service.images && service.images.length > 0 ? service.images[0] : undefined,
          description: service.description,
          slug: service.slug || service.id
        }));
        
        setTopServices(topServicesData);
        setIsLoadingTopServices(false);
      } catch (error) {
        console.error('Erreur lors du chargement des meilleurs services:', error);
        setIsLoadingTopServices(false);
        // En cas d'erreur, ne pas laisser l'utilisateur sans contenu
        // Utiliser les données simulées
        const fallbackServices = await serviceService.getTopServices(4);
        setTopServices(fallbackServices.map(service => ({
          id: service.id,
          title: service.title,
          price: service.price,
          rating: service.rating,
          totalReviews: service.totalReviews || 0,
          totalOrders: service.totalOrders || 0,
          provider: {
            id: service.provider?.id || '',
            name: service.provider?.name || 'Freelanceur',
            avatar: service.provider?.avatar
          },
          image: service.images && service.images.length > 0 ? service.images[0] : undefined,
          description: service.description,
          slug: service.slug || service.id
        })));
      }
    };
    
    fetchTopServices();
    
    // Configuration d'une tâche planifiée pour mettre à jour les services
    // Cette approche est plus efficace que setInterval pour les actualisations hebdomadaires
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7); // Prochain dimanche
    nextSunday.setHours(0, 0, 0, 0); // Minuit
    
    const timeUntilUpdate = nextSunday.getTime() - now.getTime();
    
    // Définir un timeout pour la prochaine mise à jour
    const updateTimeout = setTimeout(() => {
      fetchTopServices();
      console.log('Mise à jour hebdomadaire des meilleurs services effectuée');
    }, timeUntilUpdate);
    
    return () => {
      clearTimeout(updateTimeout);
    };
  }, []);

  return (
    <Layout
      title="NionFar | Services freelance au Sénégal à partir de 1000 FCFA"
      description="NionFar.sn - La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix."
    >
      <Head>
        <title>NionFar | Services freelance au Sénégal à partir de 1000 FCFA</title>
        <meta name="description" content="NionFar.sn - La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix." />
        <meta property="og:title" content="NionFar | Services freelance au Sénégal" />
        <meta property="og:description" content="La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix." />
        <meta property="og:url" content="https://nionfar.sn" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://nionfar.sn" />
        
        {/* Schéma JSON-LD pour l'organisation */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ 
            __html: formatJSONLD(generateOrganizationSchema())
          }} 
        />
        
        {/* Schéma JSON-LD pour la page d'accueil (WebSite) */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ 
            __html: formatJSONLD({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              'name': 'NionFar',
              'url': 'https://nionfar.sn',
              'potentialAction': {
                '@type': 'SearchAction',
                'target': 'https://nionfar.sn/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              },
              'description': 'NionFar.sn - La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix.'
            })
          }}
        />
      </Head>
      <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[800px] h-[90vw] sm:h-[800px] bg-indigo-600 opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-violet-600 opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-500 opacity-20 rounded-full blur-2xl animate-pulse"></div>
          
          <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-10"></div>
        </div>

        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-20">
              <motion.span 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block px-4 py-1 mb-6 text-xs font-medium text-indigo-200 bg-indigo-800/70 backdrop-blur-sm rounded-full ring-1 ring-indigo-600/50"
              >
                La plateforme freelance #1 au Sénégal
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight relative z-20"
              >
                Services freelance à partir de{' '}
                <ContainerTextFlip 
                  words={["1000 FCFA", "REK", "KESSE"]} 
                  interval={2500}
                  className="!bg-transparent !shadow-none !border-0 !p-0 !m-0" 
                  textClassName="!text-transparent !bg-clip-text !bg-gradient-to-r !from-indigo-300 !to-purple-300"
                />
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 sm:mt-6 text-base sm:text-xl text-indigo-100 max-w-lg relative z-20"
              >
                Connectez-vous avec les meilleurs freelances sénégalais 
                pour des services de qualité à petit prix. Satisfaction garantie !
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 relative z-20"
              >
                <Link 
                  href="/explorer" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-sm sm:text-base w-full sm:w-auto"
                >
                  Explorer les services
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/devenir-freelance" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
                >
                  Proposer mes services
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 flex flex-wrap items-center gap-6 relative z-20"
              >
                <div className="flex items-center">
                  <div className="mr-2 text-green-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100 text-sm">Paiement sécurisé</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 text-green-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100 text-sm">Livraison rapide</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 text-green-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100 text-sm">Support 7j/7</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mt-12 lg:mt-0 lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-sm opacity-75"></div>
                <div className="relative bg-white dark:bg-gray-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden">
                  <img 
                    src="/img/hero-freelance.jpg" 
                    alt="Services freelance sur NionFar" 
                    className="w-full h-auto rounded-lg sm:rounded-xl"
                  />
                  
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-tl-xl sm:rounded-tl-2xl p-2 sm:p-3 shadow-md sm:shadow-lg">
                    <div className="flex items-center space-x-1">
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold text-gray-700 ml-1">(4.9/5)</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -right-4 sm:-right-10 transform -translate-y-1/2 bg-white rounded-lg sm:rounded-2xl p-2 sm:p-4 shadow-md sm:shadow-xl flex">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <FiTrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Commandes</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">+2500 ce mois</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-3 sm:-bottom-5 left-4 sm:left-10 bg-white rounded-lg sm:rounded-2xl p-2 sm:p-4 shadow-md sm:shadow-xl flex">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-indigo-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <FiShield className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Protection</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">Paiements sécurisés</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative mt-12 lg:mt-20 max-w-3xl mx-auto pb-8 z-20"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un service (ex: logo, site web...)"
                className="pl-10 sm:pl-12 pr-24 sm:pr-32 py-4 sm:py-5 w-full rounded-full border-0 shadow-xl focus:ring-2 focus:ring-indigo-500 bg-white/95 backdrop-blur-sm text-gray-900 text-sm sm:text-base"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-transparent shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-6 sm:mb-10 relative z-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3"
            >
              Les services les plus populaires
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-2 sm:px-4"
            >
              Les services exceptionnels de nos freelances les plus performants
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {isLoadingTopServices ? (
              // Affichage d'un state de chargement
              Array(4).fill(0).map((_, index) => (
                <motion.div 
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 animate-pulse"></div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                      <div className="w-1/3 h-3 sm:h-4 bg-gray-200 animate-pulse"></div>
                      <div className="ml-auto w-1/4 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                    <div className="h-4 sm:h-6 bg-gray-200 animate-pulse mb-1 w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 animate-pulse mb-2 sm:mb-3 w-full"></div>
                    <div className="flex items-center justify-between">
                      <div className="w-1/3 h-3 sm:h-4 bg-gray-200 animate-pulse"></div>
                      <div className="w-1/4 h-3 sm:h-4 bg-gray-200 animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Affichage des meilleurs services
              topServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <Link href={`/services/${service.slug}`} legacyBehavior>
                    <a>
                      <div className="aspect-w-16 aspect-h-9 relative">
                        <img 
                          src={service.image || `/img/services/default-service.jpg`}
                          alt={service.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute top-2 right-2 bg-indigo-600 px-2 py-1 rounded-full text-xs text-white font-medium">
                          ⭐ {service.rating.toFixed(1)}/5
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center mb-2 sm:mb-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2">
                            <img 
                              src={service.provider.avatar || '/img/avatar-placeholder.jpg'}
                              alt={service.provider.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-700 truncate">{service.provider.name}</span>
                          <span className="ml-auto bg-green-100 text-green-800 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded">
                            {service.totalOrders} commandes
                          </span>
                        </div>
                        
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-2">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-indigo-600 text-xs sm:text-sm font-medium">
                            Voir le service <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="text-gray-900 font-bold text-sm sm:text-base">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XOF',
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0
                            }).format(service.price)}
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link 
              href="/explorer" 
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              Voir tous les services <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Partenaires */}
      <section className="py-10 sm:py-12 border-t border-gray-100">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <LazyTrustedPartners />
        </div>
      </section>

      <section className="relative py-8 sm:py-12 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden">
        {/* Éléments visuels en arrière-plan - optimisés pour mobile */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] sm:top-[30%] sm:left-[20%] w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] rounded-full bg-indigo-600/20 blur-[50px] sm:blur-[80px]"></div>
          <div className="absolute bottom-[10%] right-[5%] sm:bottom-[20%] sm:right-[10%] w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] rounded-full bg-purple-500/20 blur-[50px] sm:blur-[80px]"></div>
          <div className="absolute top-[5%] right-[10%] sm:top-[10%] sm:right-[20%] w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] rounded-full bg-violet-600/20 blur-[30px] sm:blur-[40px] animate-pulse"></div>
          <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] bg-center opacity-5"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-4 sm:mb-6 md:mb-8 relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2"
            >
              Ce que disent nos clients
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-base md:text-lg text-indigo-100/90 max-w-sm sm:max-w-lg md:max-w-2xl mx-auto px-2 sm:px-4"
            >
              Découvrez comment NionFar a aidé des entreprises et des particuliers à réaliser leurs projets
            </motion.p>
          </div>

          {/* Conteneur de cartes optimisé pour mobile - espacement ajusté */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="transform hover:-translate-y-1 transition-all duration-300"
            >
              <LazyTestimonialCard
                name="Abdoulaye Diop"
                title="Entrepreneur"
                testimonial="J'ai fait appel à un designer pour la création du logo de ma nouvelle entreprise. La qualité du travail et le professionnalisme m'ont impressionné !"
                avatar="/img/avatars/testimonial-1.jpg"
                rating={5}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="transform hover:-translate-y-1 transition-all duration-300"
            >
              <LazyTestimonialCard
                name="Fatou Sow"
                title="Gérante de boutique"
                testimonial="Le développeur a créé un site e-commerce parfaitement adapté à mes besoins. Mes ventes ont augmenté de 40% en 3 mois !"
                avatar="/img/avatars/testimonial-2.jpg"
                rating={5}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="transform hover:-translate-y-1 transition-all duration-300 hidden lg:block"
            >
              <LazyTestimonialCard
                name="Moussa Niang"
                title="Startupeur"
                testimonial="J'ai trouvé un rédacteur de qualité pour mon blog d'entreprise. Très professionnel et réactif, je recommande NionFar à 100% !"
                avatar="/img/avatars/testimonial-3.jpg"
                rating={4}
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="transform hover:-translate-y-1 transition-all duration-300 lg:hidden sm:block col-span-full sm:col-span-2"
            >
              <LazyTestimonialCard
                name="Aïda Kane"
                title="Influenceuse"
                testimonial="La création de mon identité visuelle a été parfaite du début à la fin. Je suis ravie du résultat et de l'expérience sur NionFar."
                avatar="/img/avatars/testimonial-4.jpg"
                rating={5}
              />
            </motion.div>

            {/* Bouton "Voir plus de témoignages" pour mobile/petits écrans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="col-span-full mt-3 sm:mt-4 flex justify-center lg:hidden"
            >
              <Link 
                href="/temoignages" 
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium backdrop-blur-sm transition-all duration-300 border border-white/20"
              >
                Voir plus de témoignages
                <FiArrowRight className="ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Transition en vague vers la section suivante - adaptée pour tous les écrans */}
        <div className="absolute -bottom-[1px] left-0 right-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#f9fafb" preserveAspectRatio="none" className="w-full h-[30px] sm:h-[40px] md:h-[60px]">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-6 sm:mb-10 relative z-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"
            >
              Comment ça marche ?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4"
            >
              Obtenez le service dont vous avez besoin en 3 étapes simples
            </motion.p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Ligne de connexion avec animation de progression */}
            <div className="absolute top-20 left-0 right-0 hidden md:block">
              <div className="h-1 w-full bg-indigo-100">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-indigo-600 rounded-full"
                ></motion.div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -5 }}
                className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
            >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg transform -translate-y-10">
                1
              </div>
                <div className="mt-[-24px]">
                  <div className="bg-indigo-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">Trouvez le bon service</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                Parcourez nos catégories et trouvez le service adapté à vos besoins parmi des milliers d'offres.
              </p>
                </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-4 border border-gray-100 md:mt-8"
            >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg transform -translate-y-10">
                2
              </div>
                <div className="mt-[-24px]">
                  <div className="bg-indigo-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">Contactez un freelance qualifié</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Discutez directement avec les professionnels pour expliquer vos besoins et obtenir un devis personnalisé.
                  </p>
                </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-4 border border-gray-100 md:mt-16"
            >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg transform -translate-y-10">
                3
              </div>
                <div className="mt-[-24px]">
                  <div className="bg-indigo-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">Recevez un travail de qualité</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Une fois la commande validée, le freelance réalise votre projet et vous livrera un travail de qualité.
                  </p>
                </div>
            </motion.div>
          </div>

            <div className="text-center mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link 
                  href="/services" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
                  Explorer les services
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-56 h-56 sm:w-80 sm:h-80 bg-indigo-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full px-4 md:px-8 lg:px-12 relative z-20">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-30 text-center md:text-left"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Vous êtes un freelance et vous cherchez des clients ?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 sm:mb-10">
                Rejoignez notre communauté de freelances talentueux et commencez à vendre vos services en quelques clics.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Link 
                  href="/devenir-freelance" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-indigo-600 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-sm sm:text-base"
                >
                  Devenir freelance
                </Link>
                <Link 
                  href="/en-savoir-plus-freelance" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
                >
                  En savoir plus
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md mx-auto md:max-w-none"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-white/20 rounded-3xl blur"></div>
                <div className="relative bg-gradient-to-br from-indigo-800/90 to-purple-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl border border-indigo-700/50">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Augmentez vos revenus</h3>
                          <p className="text-indigo-200 text-xs sm:text-sm">Trouvez de nouveaux clients facilement</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Paiements sécurisés</h3>
                          <p className="text-indigo-200 text-xs sm:text-sm">Recevez votre argent en toute sécurité</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Développez votre réputation</h3>
                          <p className="text-indigo-200 text-xs sm:text-sm">Construisez votre portefeuille client</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 text-center">
                    <p className="text-indigo-200 mb-2 text-xs sm:text-sm">Plus de 2000+ freelances nous ont rejoints</p>
                    <div className="flex items-center justify-center">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-800 bg-indigo-400"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-800 bg-purple-400"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-800 bg-pink-400"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-800 bg-indigo-600 flex items-center justify-center text-xs text-white font-medium">+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home; 