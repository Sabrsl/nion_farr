/**
 * Script initial de correction des URLs API stockées dans localStorage
 * Ce script s'exécute avant le chargement complet de la page
 */

// Configuration des URLs correctes
const INITIAL_RENDER_API_URL = 'https://nionfar-backend.onrender.com/api';
const INITIAL_RENDER_BACKEND_URL = 'https://nionfar-backend.onrender.com';

// Ancien URLs Vercel (obsolètes)
const VERCEL_API_URL = 'https://nion-farr-backend.vercel.app/api';
const VERCEL_BACKEND_URL = 'https://nion-farr-backend.vercel.app';

// URLs incorrectes qui doivent être remplacées
const OLD_URLS = [
  'https://nion-farr-backend.vercel.app',
  'https://nion-farr-backend.vercel.app/api',
  'https://nionfar-7c7c.up.railway.app',
  'https://nionfar-7c7c.up.railway.app/api',
  'https://nionfar-production.up.railway.app',
  'https://nionfar-production.up.railway.app/api',
  'http://localhost:3001',
  'http://localhost:3001/api'
];

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log('🛠️ Vérification et correction des URLs API dans localStorage...');
  
  try {
    // Définir les variables globales pour l'accès depuis d'autres scripts
    window.__CORRECT_API_URL = INITIAL_RENDER_API_URL;
    window.__CORRECT_BACKEND_URL = INITIAL_RENDER_BACKEND_URL;
    
    // Si localStorage est disponible, corriger les URLs
    if (typeof localStorage !== 'undefined') {
      // Clés à vérifier
      const keysToCheck = [
        'NEXT_PUBLIC_API_URL',
        'API_URL',
        'BACKEND_URL',
        'apiUrl',
        'baseUrl',
        'api_endpoint'
      ];
      
      // Vérifier et corriger chaque clé
      let urlsFixed = 0;
      keysToCheck.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          // Vérifier si la valeur contient une URL obsolète
          if (OLD_URLS.some(oldUrl => value.includes(oldUrl)) || 
              value.includes(VERCEL_API_URL) || 
              value.includes(VERCEL_BACKEND_URL)) {
            
            // Déterminer s'il s'agit d'une URL d'API ou de backend
            const isApiUrl = value.endsWith('/api');
            const correctUrl = isApiUrl ? INITIAL_RENDER_API_URL : INITIAL_RENDER_BACKEND_URL;
            
            // Mettre à jour avec l'URL correcte
            localStorage.setItem(key, correctUrl);
            urlsFixed++;
            console.log(`✅ URL corrigée pour ${key}: ${value} → ${correctUrl}`);
          }
        }
      });
      
      // Ajouter un indicateur pour montrer que les URLs ont été vérifiées
      if (urlsFixed > 0) {
        localStorage.setItem('api_urls_checked', 'true');
        localStorage.setItem('api_urls_check_timestamp', new Date().toISOString());
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des URLs:', error);
  }
}); 