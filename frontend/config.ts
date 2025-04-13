// Configuration de l'application
export const API_BASE_URL = 'https://nionfar-backend.onrender.com/api';
export const BACKEND_URL = 'https://nionfar-backend.onrender.com';
export const APP_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nion-farr.vercel.app';

// Fonction utilitaire pour obtenir l'URL de l'API de manière cohérente
export const getApiBaseUrl = () => {
  // Toujours retourner l'URL Render en production
  if (process.env.NODE_ENV === 'production') {
    return API_BASE_URL;
  }
  
  // En développement, vérifier si localStorage a une URL personnalisée
  if (typeof window !== 'undefined' && localStorage.getItem('API_URL')) {
    return localStorage.getItem('API_URL') || API_BASE_URL;
  }
  
  // Utiliser localhost en développement local si explicitement configuré
  if (typeof window !== 'undefined' && 
      window.location.hostname === 'localhost' && 
      process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true') {
    return 'http://localhost:3001/api';
  }
  
  // Par défaut, utiliser l'URL Render
  return API_BASE_URL;
};

// Log pour le débogage en développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('BACKEND_URL:', BACKEND_URL);
  console.log('APP_BASE_URL:', APP_BASE_URL);
  console.log('API URL active:', getApiBaseUrl());
}

// Si nous sommes côté client, forcer l'API URL dans le localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('NEXT_PUBLIC_API_URL', API_BASE_URL);
    localStorage.setItem('API_URL', API_BASE_URL);
    localStorage.setItem('apiBaseUrl', API_BASE_URL);
    localStorage.setItem('backendUrl', BACKEND_URL);
    localStorage.setItem('appBaseUrl', APP_BASE_URL);
  } catch (e) {
    console.error('Erreur lors de la définition des URLs dans localStorage', e);
  }
}

// Configuration des tokens d'authentification
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Configuration pour le stockage local
export const STORAGE_PREFIX = 'nionfar_'; 