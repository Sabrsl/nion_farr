import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  CustomUser, 
  CustomService, 
  CustomReview, 
  Certificate, 
  PortfolioItem, 
  FreelancerProfileStats 
} from '../types/custom';
import { UseFreelancerProfileOptions, UseFreelancerProfileResult } from './customHooks';

/**
 * Hook personnalisé pour récupérer les données d'un profil freelancer
 */
export function useFreelancerProfileCustom(
  username: string, 
  options?: UseFreelancerProfileOptions
): UseFreelancerProfileResult {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<CustomUser | null>(options?.initialData?.freelancer || null);
  const [services, setServices] = useState<CustomService[]>(options?.initialData?.services || []);
  const [reviews, setReviews] = useState<CustomReview[]>(options?.initialData?.reviews || []);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [statistics, setStatistics] = useState<FreelancerProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(!options?.initialData);
  const [isError, setIsError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('services');

  // Fetch data function
  const fetchData = async () => {
    if (!username) return;
    
    setIsLoading(true);
    
    try {
      // En production, ces appels seraient remplacés par des appels API réels
      // Simulation d'un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées pour la démonstration
      const mockFreelancer: CustomUser = {
        id: "1",
        name: "Samba Diallo",
        email: "samba@example.com",
        createdAt: "2021-05-15T10:00:00Z",
        memberSince: "2021-05-15T10:00:00Z",
        avatar: "/images/avatars/avatar-1.jpg",
        username: username,
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
      
      // Exemple de certificats
      const mockCertificates: Certificate[] = [
        {
          id: "1",
          title: "Certified React Developer",
          issuer: "ReactJS Academy",
          issueDate: "2022-01-10T00:00:00Z",
          credentialUrl: "https://reactjs.org/certification/123"
        },
        {
          id: "2",
          title: "Node.js Professional",
          issuer: "Node.js Foundation",
          issueDate: "2021-06-05T00:00:00Z",
          credentialUrl: "https://nodejs.org/certification/456"
        }
      ];
      
      // Exemple de portfolio
      const mockPortfolio: PortfolioItem[] = [
        {
          id: "1",
          title: "Site e-commerce Wedo",
          description: "Plateforme e-commerce complète avec paiement en ligne, gestion des stocks et administration.",
          image: "/images/portfolio/ecommerce.jpg",
          category: "E-commerce",
          technologies: ["React", "Node.js", "MongoDB", "Stripe"],
          projectUrl: "https://wedo.sn"
        },
        {
          id: "2",
          title: "Application mobile Livreur Express",
          description: "Application de livraison à la demande pour les commerces locaux.",
          image: "/images/portfolio/mobile-app.jpg",
          category: "Application Mobile",
          technologies: ["Flutter", "Firebase", "Google Maps API"],
          images: [
            "/images/portfolio/mobile-app.jpg",
            "/images/portfolio/mobile-app-2.jpg",
            "/images/portfolio/mobile-app-3.jpg"
          ]
        }
      ];
      
      // Statistiques du freelancer
      const mockStatistics: FreelancerProfileStats = {
        satisfactionRate: "98%",
        responseTime: "~2h",
        orderCompletionRate: "99%"
      };
      
      // Mise à jour de l'état avec les données simulées
      setFreelancer(mockFreelancer);
      setServices([mockService]);
      setReviews([mockReview]);
      setCertificates(mockCertificates);
      setPortfolio(mockPortfolio);
      setStatistics(mockStatistics);
      setIsFollowing(Math.random() > 0.5); // Statut aléatoire pour la démo
      
      setIsLoading(false);
      setIsError(false);
    } catch (error) {
      console.error('Error fetching freelancer data:', error);
      setIsError(true);
      setIsLoading(false);
    }
  };
  
  // Récupération des données au montage du composant ou au changement de username
  useEffect(() => {
    if (username && !options?.initialData) {
      fetchData();
    }
  }, [username]);
  
  // Fonction pour rafraîchir les données
  const refetch = () => {
    fetchData();
  };
  
  return {
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
  };
} 