import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiClock,
  FiShield,
  FiAward,
  FiCheck,
  FiMessageCircle,
  FiLink,
  FiPhone,
  FiHeart,
  FiShare2,
  FiBookmark,
  FiGlobe,
  FiTrendingUp,
  FiFileText,
  FiAlertCircle,
  FiLayers,
  FiRefreshCw,
  FiThumbsUp,
  FiCheckSquare,
  FiGrid,
  FiList,
  FiX,
  FiChevronRight,
  FiMessageSquare,
  FiHeadphones,
  FiTag,
  FiActivity
} from 'react-icons/fi';
import Head from 'next/head';

// Components
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { Rating } from '../../components/ui/Rating';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Tooltip } from '../../components/ui/Tooltip';
import { Modal } from '../../components/ui/Modal';
import { ShareOptions } from '../../components/ui/ShareOptions';
import { ServiceCard } from '../../components/services/ServiceCard';
import { PortfolioGallery } from '../../components/freelancers/PortfolioGallery';
import { SkillProgress } from '../../components/freelancers/SkillProgress';
import { UniversalServiceCard } from '../../components/services/UniversalServiceCard';
import { Review } from '../../components/services/Review';

// Hooks
import { useFreelancerProfileCustom } from '../../hooks/useFreelancerProfileCustom';
import { useToast } from '../../hooks/useToast';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { UseFreelancerProfileOptions, UseFreelancerProfileResult } from '../../hooks/customHooks';

// Service imports
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { trackEvent } from '../../utils/analytics';

// Types
import { 
  CustomUser, 
  CustomService, 
  CustomReview, 
  PortfolioItem, 
  Certificate, 
  FreelancerProfileStats,
  Tab
} from '../../types/custom';

interface FreelancerPublicProfileProps {
  initialFreelancer: CustomUser | null;
  initialServices: CustomService[];
  initialReviews: CustomReview[];
}

// Define custom Tab type compatible with the Tabs component
interface TabWithIcon {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const FreelancerPublicProfile: NextPage<FreelancerPublicProfileProps> = ({
  initialFreelancer,
  initialServices,
  initialReviews
}) => {
  const router = useRouter();
  const { username } = router.query;
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // State management
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [serviceViewMode, setServiceViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  
  // Get scrolling data for parallax effects
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const headerTranslateY = useTransform(scrollY, [0, 300], [0, -50]);
  
  // Get the profile data with our custom hook
  const { 
    freelancer, 
    services, 
    reviews, 
    certificates,
    portfolio,
    statistics,
    isLoading, 
    isError,
    isFollowing,
    setIsFollowing,
    activeTab,
    setActiveTab,
    refetch
  } = useFreelancerProfileCustom(
    typeof username === 'string' ? username : '',
    {
      initialData: {
        freelancer: initialFreelancer,
        services: initialServices,
        reviews: initialReviews
      }
    }
  );
  
  // Intersection observer for header and stats animation
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  
  // Add this useEffect to handle intersection observation
  useEffect(() => {
    if (!statsRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2
      }
    );
    
    observer.observe(statsRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [statsRef]);
  
  // Format the expertise level for display
  const expertiseLevel = useMemo(() => {
    if (!freelancer?.level) return { label: 'Freelancer', color: 'bg-gray-100 text-gray-800' };
    
    switch (freelancer.level.toLowerCase()) {
      case 'beginner':
      case 'débutant':
        return { label: 'Débutant', color: 'bg-blue-100 text-blue-800' };
      case 'intermediate':
      case 'intermédiaire':
        return { label: 'Intermédiaire', color: 'bg-teal-100 text-teal-800' };
      case 'expert':
      case 'avancé':
        return { label: 'Expert', color: 'bg-purple-100 text-purple-800' };
      case 'pro seller':
      case 'vendeur pro':
        return { label: 'Vendeur Pro', color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: freelancer.level, color: 'bg-indigo-100 text-indigo-800' };
    }
  }, [freelancer?.level]);
  
  // Handle follow/unfollow action
  const handleFollow = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/freelancers/${username}`);
      return;
    }
    
    if (!freelancer) return;
    
    try {
      // Toggle following state for instant feedback
      setIsFollowing(!isFollowing);
      
      // Track analytics event
      trackEvent(isFollowing ? 'unfollow_freelancer' : 'follow_freelancer', {
        freelancer_id: freelancer.id,
        freelancer_username: freelancer.username
      });
      
      // API call would happen here
      // const endpoint = isFollowing ? `/followers/unfollow/${username}` : `/followers/follow/${username}`;
      // await api.post(endpoint);
      
      showToast(
        isFollowing 
          ? `Vous ne suivez plus ${freelancer.name}` 
          : `Vous suivez maintenant ${freelancer.name}`,
        'success'
      );
    } catch (error) {
      // Revert state on error
      setIsFollowing(isFollowing);
      showToast("Une erreur s'est produite", 'error');
      console.error('Error following/unfollowing freelancer:', error);
    }
  }, [isAuthenticated, router, username, isFollowing, setIsFollowing, freelancer, showToast]);
  
  // Handle contact action
  const handleContact = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/freelancers/${username}`);
      return;
    }
    
    if (freelancer?.id) {
      // Track analytics event
      trackEvent('contact_freelancer', {
        freelancer_id: freelancer.id,
        freelancer_username: freelancer.username
      });
      
      router.push(`/messages/new?recipient=${freelancer.id}`);
    }
  }, [isAuthenticated, router, username, freelancer]);
  
  // Handle share action
  const handleShare = useCallback(() => {
    if (!freelancer) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${freelancer.name} sur Nionfar`,
        text: `Découvrez le profil de ${freelancer.name} sur Nionfar.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      setIsShareModalOpen(true);
    }
    
    // Track analytics event
    trackEvent('share_freelancer_profile', {
      freelancer_id: freelancer.id,
      freelancer_username: freelancer.username
    });
  }, [freelancer]);

  // Define our tabs with icons that match the expected interface
  const tabsWithIcons: TabWithIcon[] = [
    { id: 'services', label: 'Services', icon: FiTag },
    { id: 'reviews', label: `Avis (${reviews.length})`, icon: FiStar }
  ];

  // Render loading state
  if (isLoading) {
    return (
      <Layout title="Chargement du profil | Nionfar">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <Spinner size="xl" className="text-indigo-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiUser className="h-8 w-8 text-indigo-200" />
            </div>
          </div>
          <p className="mt-5 text-lg text-gray-700 font-medium">Chargement du profil...</p>
          <p className="text-gray-500">Veuillez patienter un instant</p>
        </div>
      </Layout>
    );
  }

  // Render error state
  if (isError || !freelancer) {
    return (
      <Layout title="Profil non trouvé | Nionfar">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Alert
            variant="error"
            title="Freelancer non trouvé"
            message="Ce profil n'existe pas ou n'est plus disponible."
            actions={
              <Link href="/explorer">
                <Button variant="primary">Explorer les services</Button>
              </Link>
            }
          />
        </div>
      </Layout>
    );
  }

  // Stats for the freelancer
  const stats = [
    {
      label: 'Services actifs',
      value: services.length || '0',
      icon: FiTag
    },
    {
      label: 'Projets complétés',
      value: freelancer.completedOrders || '0',
      icon: FiCheck
    },
    {
      label: 'Note moyenne',
      value: freelancer.rating ? `${freelancer.rating.toFixed(1)}/5` : 'N/A',
      icon: FiStar
    },
    {
      label: 'Taux de satisfaction',
      value: '98%',
      icon: FiThumbsUp
    }
  ];

  return (
    <Layout 
      title={`${freelancer.name} | Profil Freelance`}
      description={freelancer.bio || `Profil freelance de ${freelancer.name} sur Nionfar. ${freelancer.specialty || 'Professionnel freelance'}`}
    >
      {/* Hero section with parallax effect */}
      <motion.div 
        className="relative bg-gradient-to-r from-indigo-700 to-purple-700 text-white overflow-hidden"
        style={{ 
          opacity: headerOpacity,
          y: headerTranslateY
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0">
          <svg className="w-full h-full text-white/5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar with animation */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative group">
                  <Avatar
                    src={freelancer.avatar}
                    alt={freelancer.name}
                    size="xl"
                    className="border-4 border-white shadow-xl"
                  />
                  {freelancer.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1.5 border-2 border-white shadow-md">
                      <FiCheck className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  {/* Hover animation */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Photo de profil</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Main information */}
            <div className="text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{freelancer.name}</h1>
                
                <div className="inline-flex items-center bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 text-sm mt-2 mb-4">
                  <FiUser className="mr-2 h-4 w-4" />
                  {freelancer.specialty || 'Freelancer'}
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                  {freelancer.isVerified && (
                    <Badge 
                      variant="success" 
                      className="bg-green-500/20 text-green-100 border-green-500/30 backdrop-blur-sm"
                    >
                      <FiCheck className="h-3.5 w-3.5 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                  
                  <Badge 
                    variant="info"
                    className="bg-indigo-500/20 text-indigo-100 border-indigo-500/30 backdrop-blur-sm"
                  >
                    <FiStar className="h-3.5 w-3.5 mr-1" />
                    {freelancer.rating || '4.5'} ({reviews.length} avis)
                  </Badge>
                  
                  <Badge 
                    variant="info"
                    className="bg-indigo-500/20 text-indigo-100 border-indigo-500/30 backdrop-blur-sm"
                  >
                    <FiCalendar className="h-3.5 w-3.5 mr-1" />
                    Membre depuis {formatDate(freelancer.createdAt, { year: 'numeric', month: 'long' })}
                  </Badge>
                  
                  {freelancer.level && (
                    <Badge 
                      variant="primary" 
                      className="bg-purple-500/20 text-purple-100 border-purple-500/30 backdrop-blur-sm"
                    >
                      <FiAward className="h-3.5 w-3.5 mr-1" />
                      {expertiseLevel.label}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Button 
                    variant="secondary" 
                    className="bg-white text-indigo-700 hover:bg-indigo-50"
                    onClick={handleContact}
                  >
                    <FiMessageSquare className="mr-2 h-5 w-5" />
                    Contacter
                  </Button>
                  
                  <Button variant="outline" className="bg-indigo-500/20 text-white border-white/30 hover:bg-indigo-500/30">
                    <FiHeart className="mr-2 h-5 w-5" />
                    Suivre
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="bg-indigo-800/50 backdrop-blur-md border-t border-indigo-600/20 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="flex flex-col items-center md:items-start"
                >
                  <div className="flex items-center text-indigo-200 mb-1">
                    <stat.icon className="h-4 w-4 mr-1.5" />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <span className="text-white text-xl font-semibold">{stat.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column (info and contact) */}
          <div className="md:col-span-1">
            {/* Bio and information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiUser className="h-5 w-5 mr-2 text-indigo-600" />
                À propos
              </h2>
              
              <div className="prose prose-indigo prose-sm max-w-none mb-6">
                {freelancer.bio ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {freelancer.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">Aucune bio renseignée.</p>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations</h3>
              
              <div className="space-y-4">
                {freelancer.address && (
                  <div className="flex items-start">
                    <FiMapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Localisation</p>
                      <p className="text-sm text-gray-600">{freelancer.address}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <FiCalendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Membre depuis</p>
                    <p className="text-sm text-gray-600">{formatDate(freelancer.createdAt, { year: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                
                {freelancer.languages && freelancer.languages.length > 0 && (
                  <div className="flex items-start">
                    <FiGlobe className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Langues</p>
                      <p className="text-sm text-gray-600">{freelancer.languages.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Skills section */}
              {freelancer.skills && freelancer.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiActivity className="h-5 w-5 mr-2 text-indigo-600" />
                    Compétences
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Contact card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiMessageSquare className="h-5 w-5 mr-2" />
                Contacter
              </h2>
              
              <p className="text-indigo-100 mb-6">
                Besoin d'un service personnalisé ? N'hésitez pas à contacter {freelancer.name} directement pour discuter de votre projet.
              </p>
              
              <div className="space-y-4 mb-6">
                {freelancer.responseTime && (
                  <div className="flex items-center text-indigo-100">
                    <FiClock className="h-5 w-5 mr-3" />
                    <span>Temps de réponse: {freelancer.responseTime}</span>
                  </div>
                )}
                
                <div className="flex items-center text-indigo-100">
                  <FiHeadphones className="h-5 w-5 mr-3" />
                  <span>Support disponible</span>
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                fullWidth
                className="bg-white text-indigo-700 hover:bg-indigo-50"
                onClick={handleContact}
              >
                Envoyer un message
              </Button>
            </motion.div>
          </div>
          
          {/* Right column (services and reviews) */}
          <div className="md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Tabs */}
              <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={tabsWithIcons}
                className="mb-8"
              />
              
              {/* Services tab */}
              {activeTab === 'services' && (
                <div>
                  {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {services.map((service) => (
                        <UniversalServiceCard
                          key={service.id}
                          service={service}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service disponible</h3>
                      <p className="text-gray-600">
                        {freelancer.name} n'a pas encore publié de services sur la plateforme.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Reviews tab */}
              {activeTab === 'reviews' && (
                <div>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <Review
                          key={review.id}
                          review={review}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <FiStar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h3>
                      <p className="text-gray-600">
                        Soyez le premier à laisser un avis sur les services de {freelancer.name}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Share modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Partager ce profil"
        size="sm"
      >
        <ShareOptions
          url={typeof window !== 'undefined' ? window.location.href : `https://nionfar.sn/freelancers/${freelancer.username}`}
          title={`Profil de ${freelancer.name} sur Nionfar`}
          description={freelancer.bio?.substring(0, 100) || `Découvrez les services de ${freelancer.name}, ${freelancer.specialty || 'freelancer'} sur Nionfar.`}
          image={freelancer.avatar}
          onShare={() => setIsShareModalOpen(false)}
        />
      </Modal>
      
      {/* Portfolio item detail modal */}
      <Modal
        isOpen={!!selectedPortfolioItem}
        onClose={() => setSelectedPortfolioItem(null)}
        size="lg"
      >
        {selectedPortfolioItem && (
          <div className="p-0">
            <div className="relative aspect-video bg-gray-900">
              <Image
                src={selectedPortfolioItem.image || selectedPortfolioItem.images?.[0] || '/images/placeholder-portfolio.jpg'}
                alt={selectedPortfolioItem.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedPortfolioItem.title}</h3>
                  <p className="text-gray-500 mt-1">{selectedPortfolioItem.category}</p>
                </div>
                {selectedPortfolioItem.projectUrl && (
                  <a
                    href={selectedPortfolioItem.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium inline-flex items-center"
                  >
                    Voir le projet <FiChevronRight className="ml-1 h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-gray-700 mt-4">{selectedPortfolioItem.description}</p>
              
              {/* Technical details */}
              {selectedPortfolioItem.technologies && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Technologies utilisées</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPortfolioItem.technologies.map((tech: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional images */}
              {selectedPortfolioItem.images && selectedPortfolioItem.images.length > 1 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Images supplémentaires</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPortfolioItem.images.slice(1).map((image: string, index: number) => (
                      <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${selectedPortfolioItem.title} - image ${index + 2}`}
                          fill
                          sizes="(max-width: 768px) 30vw, 15vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.params || {};
  
  if (!username || typeof username !== 'string') {
    return {
      notFound: true
    };
  }
  
  try {
    // In a production environment, replace these mocked calls with real API calls
    // const freelancerResponse = await api.get(`/freelancers/${username}`);
    // const servicesResponse = await api.get(`/freelancers/${username}/services`);
    // const reviewsResponse = await api.get(`/freelancers/${username}/reviews`);
    
    // Simulate a freelancer for demo
    const mockFreelancer: CustomUser = {
      id: "1",
      name: "Samba Diallo",
      email: "samba@example.com",
      createdAt: "2021-05-15T10:00:00Z",
      memberSince: "2021-05-15T10:00:00Z",
      avatar: "/images/avatars/avatar-1.jpg",
      username: username as string,
      level: "Vendeur Pro",
      rating: 4.8,
      completedOrders: 124,
      isVerified: true,
      specialty: "Développeur Web & Mobile",
      bio: "Développeur fullstack avec plus de 5 ans d'expérience. Spécialisé dans la création d'applications web et mobiles optimisées et conviviales. Je m'engage à fournir un travail de qualité dans les délais impartis.",
      skills: ["React", "Node.js", "Laravel", "Flutter", "AWS", "Firebase"],
      languages: ["Français", "Anglais", "Wolof"],
      website: "www.sambadiallo.com",
      address: "Dakar, Sénégal",
      responseTime: "~2 heures"
    };
    
    // Exemple de service de démonstration
    const mockService: CustomService = {
      id: "1",
      title: "Développement d'application web React",
      description: "Je développerai une application web professionnelle avec React et Node.js, optimisée pour les performances et l'expérience utilisateur.",
      price: 25000,
      isActive: true,
      slug: "developpement-application-web-react",
      createdAt: "2022-01-15T10:00:00Z",
      updatedAt: "2022-01-15T10:00:00Z"
    };
    
    // Exemple d'avis de démonstration
    const mockReview: CustomReview = {
      id: "1",
      rating: 5,
      content: "Excellent travail, très professionnel et réactif. Je recommande vivement!",
      createdAt: "2022-02-20T10:00:00Z",
      reviewer: {
        id: "user123",
        name: "Fatou Ndiaye",
        avatar: "/images/avatars/avatar-2.jpg"
      }
    };
    
    const mockFreelancerServices: CustomService[] = [mockService]; 
    const mockFreelancerReviews: CustomReview[] = [mockReview]; 
    
    return {
      props: {
        initialFreelancer: mockFreelancer,
        initialServices: mockFreelancerServices,
        initialReviews: mockFreelancerReviews
      }
    };
  } catch (error) {
    console.error('Error fetching freelancer data:', error);
    return {
      notFound: true
    };
  }
};

export default FreelancerPublicProfile;