// Export des données de production
export { categories } from './categories';
export { productionServices, getServicesByCategory, getServiceById, getServiceBySlug } from './production-services';

// Stubs pour les données qui ne sont plus utilisées en production
// Conservés pour la compatibilité avec le code existant
export const currentUser = {};
export const freelancerServices = [];
export const freelancerOrders = [];
export const freelancerStats = { orders: 0, revenue: 0, rating: 0 };
export const userNotifications = [];
export const userTransactions = [];
export const userWithdrawals = [];

// Stubs pour les conversations et messages
export const conversations = [];
export const messages = [];
export const getMessagesByConversationId = () => [];
export const getConversationById = () => null;
export const getConversationsByUserId = () => [];

// Stubs pour les avis
export const reviews = [];
export const getReviewsByServiceId = () => [];
export const getReviewsByUserId = () => [];
export const getReviewById = () => null;

// Pour la compatibilité avec le code existant, nous réexportons également les anciennes données
export * from './services'; 