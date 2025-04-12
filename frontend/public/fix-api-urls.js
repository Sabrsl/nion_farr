/**
 * Script de correction des URLs API stockées dans localStorage
 * Ce script corrige les URLs qui pointent vers l'ancienne API Railway ou autre vers la nouvelle URL Render
 */

// Configuration des URLs correctes
const CORRECT_API_URL = 'https://nionfar-backend.onrender.com/api';
const CORRECT_BACKEND_URL = 'https://nionfar-backend.onrender.com';

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

// Fonction pour corriger les URLs dans localStorage
function fixApiUrls() {
  console.log('🔧 Vérification des URLs API dans localStorage...');
  
  try {
    // Vérifier si localStorage est disponible
    if (typeof localStorage === 'undefined') {
      console.warn('⚠️ localStorage n\'est pas disponible dans cet environnement');
      return;
    }
    
    // Vérifier les clés spécifiques qui pourraient contenir des URLs API
    const keysToCheck = [
      'NEXT_PUBLIC_API_URL',
      'API_URL',
      'BACKEND_URL',
      'api_endpoint',
      'baseUrl',
      'apiUrl'
    ];
    
    let urlsFixed = 0;
    
    // Parcourir et corriger les clés spécifiques
    keysToCheck.forEach(key => {
      if (localStorage.getItem(key)) {
        const value = localStorage.getItem(key);
        
        // Vérifier si la valeur est une des URLs incorrectes
        if (OLD_URLS.some(oldUrl => value.includes(oldUrl))) {
          // Déterminer s'il s'agit d'une URL d'API ou de backend
          const isApiUrl = value.endsWith('/api');
          const correctUrl = isApiUrl ? CORRECT_API_URL : CORRECT_BACKEND_URL;
          
          // Mettre à jour avec l'URL correcte
          localStorage.setItem(key, correctUrl);
          console.log(`✅ URL corrigée pour ${key}: ${value} -> ${correctUrl}`);
          urlsFixed++;
        }
      }
    });
    
    // Vérifier les objets JSON stockés qui pourraient contenir des URLs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!keysToCheck.includes(key)) {
        try {
          const value = localStorage.getItem(key);
          const jsonObject = JSON.parse(value);
          
          // Vérifier si l'objet JSON contient une propriété qui pourrait être une URL
          let objectUpdated = false;
          
          // Fonction récursive pour parcourir l'objet et corriger les URLs
          function updateUrls(obj) {
            for (const prop in obj) {
              if (typeof obj[prop] === 'string') {
                // Vérifier si la propriété contient une URL incorrecte
                OLD_URLS.forEach(oldUrl => {
                  if (obj[prop].includes(oldUrl)) {
                    // Remplacer l'URL incorrecte par la correcte
                    const isApiUrl = obj[prop].endsWith('/api');
                    const correctUrl = isApiUrl ? CORRECT_API_URL : CORRECT_BACKEND_URL;
                    obj[prop] = obj[prop].replace(oldUrl, isApiUrl ? CORRECT_API_URL : CORRECT_BACKEND_URL);
                    objectUpdated = true;
                  }
                });
              } else if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                // Récursivement parcourir les objets imbriqués
                updateUrls(obj[prop]);
              }
            }
          }
          
          updateUrls(jsonObject);
          
          if (objectUpdated) {
            localStorage.setItem(key, JSON.stringify(jsonObject));
            console.log(`✅ URLs corrigées dans l'objet JSON stocké sous la clé ${key}`);
            urlsFixed++;
          }
        } catch (e) {
          // Ignorer les erreurs de parsing JSON - ce n'est probablement pas un objet JSON
        }
      }
    }
    
    // Rapport final
    if (urlsFixed > 0) {
      console.log(`🎉 Correction terminée: ${urlsFixed} URL(s) corrigée(s)`);
      // Indiquer que la correction a été effectuée
      localStorage.setItem('api_urls_fixed', 'true');
      localStorage.setItem('api_urls_fixed_timestamp', new Date().toISOString());
    } else {
      console.log('✅ Aucune URL incorrecte trouvée dans localStorage');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des URLs:', error);
  }
}

// Exécuter la correction
if (document.readyState === 'complete') {
  fixApiUrls();
} else {
  document.addEventListener('DOMContentLoaded', fixApiUrls);
} 