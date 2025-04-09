// Configuration de l'application
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api';

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