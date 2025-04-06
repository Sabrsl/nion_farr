import { User as BaseUser, Service as BaseService, Review as BaseReview } from './index';
import { ReactNode } from 'react';

// Extension du type User avec les propriétés supplémentaires utilisées dans la page de profil freelancer
export interface CustomUser {
  id: string;
  name: string;
  email: string;
  username: string;
  createdAt: string;
  memberSince: string;
  avatar?: string;
  level?: string;
  rating?: number;
  completedOrders?: number;
  isVerified?: boolean;
  specialty?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  website?: string;
  address?: string;
  responseTime?: string;
  role?: 'client' | 'provider' | 'admin';
}

// Extension du type Service avec les propriétés supplémentaires
export interface CustomService extends Partial<BaseService> {
  id: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  // Autres propriétés utilisées dans ServiceGridItem
}

// Extension du type Review avec les propriétés supplémentaires
export interface CustomReview extends Partial<BaseReview> {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  // Autres propriétés utilisées dans le composant Review
}

// Type pour les statistiques du freelancer
export interface FreelancerProfileStats {
  earnings?: {
    total: number;
    pending: number;
    withdrawn: number;
    available: number;
  };
  analytics?: {
    totalOrders: number;
    views: number;
    conversionRate: number;
    averageRating: number;
    totalReviews: number;
  };
  satisfactionRate?: string;
  responseTime?: string;
  orderCompletionRate?: string;
}

// Type pour les données du portfolio
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  category?: string;
  images?: string[];
  projectUrl?: string;
  technologies?: string[];
}

// Type pour les certificats
export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

// Types pour le composant Tabs
export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

// Type pour les données retournées par useFreelancerProfile
export interface FreelancerProfileData {
  freelancer: CustomUser | null;
  services: CustomService[];
  reviews: CustomReview[];
  certificates?: Certificate[];
  portfolio?: PortfolioItem[];
  statistics?: FreelancerProfileStats;
} 