/**
 * Configuration globale pour le frontend
 * Contient les paramètres essentiels utilisés dans toute l'application
 */

// URL de base de l'API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nionfar.sn';

/**
 * Récupère l'URL de base de l'API en fonction de l'environnement
 */
export const getApiBaseUrl = (): string => {
  // Priorité à la variable d'environnement si définie
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Sinon, déterminer l'URL en fonction de l'environnement
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  } else if (process.env.NEXT_PUBLIC_IS_PREVIEW === 'true') {
    return 'https://nionfar-backend-preview.onrender.com/api';
  } else {
    return 'https://nionfar-backend.onrender.com/api';
  }
}; 