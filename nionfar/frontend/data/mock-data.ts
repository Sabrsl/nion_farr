import { 
  Order, 
  Service, 
  Category, 
  User, 
  FreelancerStats, 
  Notification,
  Transaction,
  Withdrawal
} from '../types';
import { categories } from './categories';
import { productionServices } from './production-services';

// Utilisateur minimal
export const currentUser = null;

// Services - version vide
export const freelancerServices: Service[] = [];

// Commandes - aucune commande pour la production
export const freelancerOrders: Order[] = [];

// Statistiques vides
export const freelancerStats: FreelancerStats = {
  earnings: {
    total: 0,
    pending: 0,
    withdrawn: 0,
    available: 0
  },
  analytics: {
    totalOrders: 0,
    views: 0,
    conversionRate: 0,
    averageRating: 0,
    totalReviews: 0,
    clicks: 0,
    completionRate: 0,
    pendingOrders: 0,
    totalEarnings: 0
  },
  activeOrders: 0,
  pendingReviews: 0,
  responseRate: 0,
  responseTime: '0'
};

// Données vides pour la production
export const userNotifications: Notification[] = [];
export const userTransactions: Transaction[] = [];
export const userWithdrawals: Withdrawal[] = [];

// Export des catégories
export { categories }; 