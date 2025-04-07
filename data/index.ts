// Export des données de production
export { categories } from './categories';
export { productionServices, getServicesByCategory, getServiceById, getServiceBySlug } from './production-services';

// Export des données utilisateur (minimales pour la production)
export {
  currentUser,
  freelancerServices,
  freelancerOrders,
  freelancerStats,
  userNotifications,
  userTransactions,
  userWithdrawals
} from './mock-data';

// Export des données de conversations (vides pour la production)
export {
  conversations,
  messages,
  getMessagesByConversationId,
  getConversationById,
  getConversationsByUserId
} from './mockMessages';

// Export des données d'avis (vides pour la production)
export {
  reviews,
  getReviewsByServiceId,
  getReviewsByUserId,
  getReviewById
} from './reviews';

// Pour la compatibilité avec le code existant, nous réexportons également les anciennes données
export * from './services'; 