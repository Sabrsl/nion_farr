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

/**
 * Fichier de données nettoyé pour l'environnement de production.
 * Toutes les données moquées ont été remplacées par des tableaux vides.
 */

// Utilisateur non défini en production
export const currentUser = null;

// Tableaux vides pour la production
export const freelancerServices: Service[] = [];
export const freelancerOrders: Order[] = [];
export const userNotifications: Notification[] = [];
export const userTransactions: Transaction[] = [];
export const userWithdrawals: Withdrawal[] = [];

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

// Export des catégories (données réelles)
export { categories }; 