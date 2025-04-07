import { 
  CustomUser, 
  CustomService, 
  CustomReview, 
  Certificate, 
  PortfolioItem, 
  FreelancerProfileStats,
  FreelancerProfileData
} from '../types/custom';

// Type pour les options du hook useFreelancerProfile
export interface UseFreelancerProfileOptions {
  initialData?: {
    freelancer: CustomUser | null;
    services: CustomService[];
    reviews: CustomReview[];
  };
}

// Type pour les données retournées par useFreelancerProfile
export interface UseFreelancerProfileResult {
  freelancer: CustomUser | null;
  services: CustomService[];
  reviews: CustomReview[];
  certificates: Certificate[];
  portfolio: PortfolioItem[];
  statistics: FreelancerProfileStats | null;
  isLoading: boolean;
  isError: boolean;
  isFollowing: boolean;
  setIsFollowing: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  refetch: () => void;
} 