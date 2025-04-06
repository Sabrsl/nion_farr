import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Simulated data types

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  specialty?: string;
  address?: string;
  level?: string;
  isVerified?: boolean;
  memberSince?: string;
  createdAt: string;
  rating?: number;
  completedOrders?: number;
  skills?: string[];
  languages?: string[];
  website?: string;
  phone?: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  deliveryTime: number;
  image?: string;
  rating?: number;
  totalReviews?: number;
  category?: {
    id: string;
    name: string;
  };
  sellerId?: string;
  provider?: User;
  orderCount?: number;
  revisions?: number | string;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
  images?: string[];
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  service?: {
    id: string;
    title: string;
    slug?: string;
  };
  reply?: {
    content: string;
    createdAt: string;
  };
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  category?: string;
  images?: string[];
  projectUrl?: string;
  technologies?: string[];
}

interface Statistics {
  satisfactionRate: string;
  responseTime: string;
  orderCompletionRate?: string;
}

interface FreelancerProfileData {
  freelancer: User | null;
  services: Service[];
  reviews: Review[];
}

interface UseFreelancerProfileOptions {
  initialData?: FreelancerProfileData;
}

export function useFreelancerProfile(username: string, options?: UseFreelancerProfileOptions) {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<User | null>(options?.initialData?.freelancer || null);
  const [services, setServices] = useState<Service[]>(options?.initialData?.services || []);
  const [reviews, setReviews] = useState<Review[]>(options?.initialData?.reviews || []);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(!options?.initialData);
  const [isError, setIsError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('services');

  // Fetch data function
  const fetchData = async () => {
    if (!username) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, these would be API calls
      // const freelancerResponse = await api.get(`/freelancers/${username}`);
      // const servicesResponse = await api.get(`/freelancers/${username}/services`);
      // const reviewsResponse = await api.get(`/freelancers/${username}/reviews`);
      
      // Simulating API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock freelancer data
      const mockFreelancer: User = {
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
        address: "Dakar, Sénégal"
      };
      
      // Mock services
      const mockServices: Service[] = [
        {
          id: "1",
          title: "Développement de site web responsive",
          slug: "developpement-site-web-responsive",
          description: "Création de site web moderne et responsive avec React et Next.js",
          price: 150000,
          deliveryTime: 7,
          image: "/images/services/web-dev.jpg",
          rating: 4.9,
          totalReviews: 56,
          category: {
            id: "1",
            name: "Développement Web"
          }
        },
        {
          id: "2",
          title: "Développement d'application mobile",
          slug: "developpement-application-mobile",
          description: "Application mobile native pour iOS et Android avec Flutter",
          price: 250000,
          deliveryTime: 14,
          image: "/images/services/mobile-dev.jpg",
          rating: 4.7,
          totalReviews: 34,
          category: {
            id: "2",
            name: "Développement Mobile"
          }
        }
      ];
      
      // Mock reviews
      const mockReviews: Review[] = [
        {
          id: "1",
          rating: 5,
          title: "Excellent travail!",
          content: "Samba a livré un travail de grande qualité, dans les délais impartis. La communication était excellente tout au long du projet.",
          createdAt: "2023-05-10T09:30:00Z",
          reviewer: {
            id: "101",
            name: "Amadou Sow",
            avatar: "/images/avatars/client-1.jpg"
          },
          service: {
            id: "1",
            title: "Développement de site web responsive",
            slug: "developpement-site-web-responsive"
          }
        },
        {
          id: "2",
          rating: 4,
          content: "Bon travail, quelques retards mais le résultat final est de qualité.",
          createdAt: "2023-04-22T14:15:00Z",
          reviewer: {
            id: "102",
            name: "Fatou Diop",
            avatar: "/images/avatars/client-2.jpg"
          },
          service: {
            id: "2",
            title: "Développement d'application mobile",
            slug: "developpement-application-mobile"
          },
          reply: {
            content: "Merci pour votre avis, Fatou. Je m'excuse pour les retards et je suis heureux que le résultat final vous ait satisfait.",
            createdAt: "2023-04-23T10:05:00Z"
          }
        }
      ];
      
      // Mock certificates
      const mockCertificates: Certificate[] = [
        {
          id: "1",
          title: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          issueDate: "2022-03-15T00:00:00Z",
          expiryDate: "2025-03-15T00:00:00Z",
          credentialUrl: "https://aws.amazon.com/certification/"
        },
        {
          id: "2",
          title: "React Developer Professional",
          issuer: "Meta",
          issueDate: "2021-08-10T00:00:00Z"
        }
      ];
      
      // Mock portfolio
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
      
      // Mock statistics
      const mockStatistics: Statistics = {
        satisfactionRate: "98%",
        responseTime: "~2h",
        orderCompletionRate: "99%"
      };
      
      // Set state with mock data
      setFreelancer(mockFreelancer);
      setServices(mockServices);
      setReviews(mockReviews);
      setCertificates(mockCertificates);
      setPortfolio(mockPortfolio);
      setStatistics(mockStatistics);
      setIsFollowing(Math.random() > 0.5); // Randomly set following status for demo
      
      setIsLoading(false);
      setIsError(false);
    } catch (error) {
      console.error('Error fetching freelancer data:', error);
      setIsError(true);
      setIsLoading(false);
    }
  };
  
  // Fetch data on mount or username change
  useEffect(() => {
    if (username && !options?.initialData) {
      fetchData();
    }
  }, [username]);
  
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