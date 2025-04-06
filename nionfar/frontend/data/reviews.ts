import { Review } from '../types';

// Avis vides pour la production
export const reviews: Review[] = [];

// Fonction utilitaire pour obtenir les avis d'un service
export const getReviewsByServiceId = (serviceId: string): Review[] => {
  return [];
};

// Fonction utilitaire pour obtenir les avis laissés par un utilisateur
export const getReviewsByUserId = (userId: string): Review[] => {
  return [];
};

// Fonction utilitaire pour obtenir un avis par ID
export const getReviewById = (reviewId: string): Review | undefined => {
  return undefined;
}; 