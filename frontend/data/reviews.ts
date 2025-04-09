import { Review } from '../types';

/**
 * Fichier de données nettoyé pour l'environnement de production.
 * Toutes les données moquées ont été remplacées par des tableaux vides
 * et des fonctions qui renvoient des valeurs par défaut.
 */

// Avis vides pour la production
export const reviews: Review[] = [];

// Fonction qui retourne un tableau vide
export const getReviewsByServiceId = (serviceId: string): Review[] => {
  return [];
};

// Fonction qui retourne un tableau vide
export const getReviewsByUserId = (userId: string): Review[] => {
  return [];
};

// Fonction qui retourne undefined
export const getReviewById = (reviewId: string): Review | undefined => {
  return undefined;
}; 