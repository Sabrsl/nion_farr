// Configuration de l'application
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nion-farr-backend.vercel.app/api';
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://nion-farr-backend.vercel.app';
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app';

// Log pour le débogage en développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('BACKEND_URL:', BACKEND_URL);
  console.log('APP_BASE_URL:', APP_BASE_URL);
}

// Autres paramètres de configuration
export const APP_NAME = 'Nionfar';
export const DEFAULT_LANGUAGE = 'fr';
export const PRODUCTS_PER_PAGE = 10;
export const CURRENCY = 'XOF';
export const IMAGE_PLACEHOLDER = '/images/placeholder.jpg';
export const AVATAR_PLACEHOLDER = '/images/avatar-placeholder.png';

// Configuration des timeouts des requêtes
export const REQUEST_TIMEOUT = 30000; // 30 secondes

// Configuration des tokens d'authentification
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Configuration pour le stockage local
export const STORAGE_PREFIX = 'nionfar_'; 