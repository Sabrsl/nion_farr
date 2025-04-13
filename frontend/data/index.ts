// Export des données de production
export { categories } from './categories';
export { productionServices, getServicesByCategory, getServiceById, getServiceBySlug } from './production-services';

// DEAD_CODE: Ces exports ne sont pas utilisés dans le code de production
// Ils peuvent être supprimés ou remplacés par des stubs vides
export {
  currentUser,
  freelancerServices,
  freelancerOrders,
  freelancerStats,
  userNotifications,
  userTransactions,
  userWithdrawals
} from './mock-data';

// DEAD_CODE: Ces exports de données fictives ne sont pas utilisés dans le code de production
export {
  conversations,
  messages,
  getMessagesByConversationId,
  getConversationById,
  getConversationsByUserId
} from './mockMessages';

// DEAD_CODE: Ces exports de données fictives ne sont pas utilisés dans le code de production
export {
  reviews,
  getReviewsByServiceId,
  getReviewsByUserId,
  getReviewById
} from './reviews';

// Pour la compatibilité avec le code existant, nous réexportons également les anciennes données
export * from './services'; 