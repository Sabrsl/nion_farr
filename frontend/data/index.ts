// Export des données de production
export { categories } from './categories';
export { productionServices, getServicesByCategory, getServiceById, getServiceBySlug } from './production-services';

// Stubs pour les données qui ne sont plus utilisées en production
// Conservés pour la compatibilité avec le code existant
// Ces stubs sont nécessaires pour éviter des erreurs lors de l'importation dans du code legacy
// @ts-prune-ignore
export const currentUser = {};
// @ts-prune-ignore
export const freelancerServices = [];
// @ts-prune-ignore
export const freelancerOrders = [];
// @ts-prune-ignore
export const freelancerStats = { orders: 0, revenue: 0, rating: 0 };
// @ts-prune-ignore
export const userNotifications = [];
// @ts-prune-ignore
export const userTransactions = [];
// @ts-prune-ignore
export const userWithdrawals = [];

// Stubs pour les conversations et messages
// @ts-prune-ignore
export const conversations = [];
// @ts-prune-ignore
export const messages = [];
// @ts-prune-ignore
export const getMessagesByConversationId = () => [];
// @ts-prune-ignore
export const getConversationById = () => null;
// @ts-prune-ignore
export const getConversationsByUserId = () => [];

// Stubs pour les avis
// @ts-prune-ignore
export const reviews = [];
// @ts-prune-ignore
export const getReviewsByServiceId = () => [];
// @ts-prune-ignore
export const getReviewsByUserId = () => [];
// @ts-prune-ignore
export const getReviewById = () => null;

// Pour la compatibilité avec le code existant, nous réexportons également les anciennes données
export * from './services'; 