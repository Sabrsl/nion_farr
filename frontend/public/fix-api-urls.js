/**
 * Script pour corriger les URLs d'API stockées dans le localStorage
 * Ce script est exécuté au chargement de la page pour s'assurer que l'application
 * utilise toujours le bon backend Vercel et non les anciens backends
 */

(function() {
  // URLs corrects
  const CORRECT_API_URL = 'https://nion-farr-backend.vercel.app/api';
  const CORRECT_BACKEND_URL = 'https://nion-farr-backend.vercel.app';

  // Pattern d'URLs à remplacer
  const OLD_URLS = [
    'nionfar.up.railway.app',
    'nionfar.railway.app',
    'railway.app',
    'render.com'
  ];

  function fixApiUrls() {
    // Vérifier que localStorage est disponible
    if (!window.localStorage) {
      console.warn('LocalStorage non disponible, impossible de corriger les URLs');
      return;
    }

    // Parcourir tous les éléments dans localStorage
    try {
      // Liste des clés connues qui pourraient contenir des URLs d'API
      const keysToCheck = [
        'api_url',
        'backend_url',
        'apiUrl',
        'backendUrl',
        'NEXT_PUBLIC_API_URL',
        'auth_api_url',
        'last_api_url'
      ];

      // Vérifier les clés spécifiques
      keysToCheck.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          // Vérifier si la valeur contient une ancienne URL
          let needsUpdate = false;
          OLD_URLS.forEach(oldUrl => {
            if (value.includes(oldUrl)) {
              needsUpdate = true;
            }
          });

          // Mettre à jour si nécessaire
          if (needsUpdate) {
            console.log(`📝 Correction de l'URL d'API dans localStorage['${key}']`);
            
            // Selon la clé, mettre la valeur correcte
            if (key.includes('api')) {
              localStorage.setItem(key, CORRECT_API_URL);
            } else {
              localStorage.setItem(key, CORRECT_BACKEND_URL);
            }
          }
        }
      });

      // Vérifier les objets JSON stockés qui pourraient contenir des URLs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        // Ne pas vérifier les clés déjà traitées
        if (keysToCheck.includes(key)) continue;
        
        const value = localStorage.getItem(key);
        if (!value) continue;
        
        // Vérifier si la valeur est un JSON et contient une ancienne URL
        try {
          // Pour les objets JSON qui pourraient contenir des URLs
          if (value.startsWith('{') || value.startsWith('[')) {
            const jsonValue = JSON.parse(value);
            
            // Vérifier si l'objet JSON contient des URLs à corriger
            let jsonModified = false;
            
            // Fonction récursive pour parcourir l'objet JSON
            function checkAndReplaceUrls(obj) {
              for (const key in obj) {
                if (typeof obj[key] === 'string') {
                  OLD_URLS.forEach(oldUrl => {
                    if (obj[key].includes(oldUrl)) {
                      // Remplacer l'URL
                      const newUrl = obj[key].includes('/api') ? CORRECT_API_URL : CORRECT_BACKEND_URL;
                      obj[key] = newUrl;
                      jsonModified = true;
                    }
                  });
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                  checkAndReplaceUrls(obj[key]);
                }
              }
            }
            
            // Vérifier l'objet JSON
            checkAndReplaceUrls(jsonValue);
            
            // Si des modifications ont été apportées, sauvegarder l'objet
            if (jsonModified) {
              console.log(`📝 Correction des URLs dans l'objet JSON '${key}'`);
              localStorage.setItem(key, JSON.stringify(jsonValue));
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing JSON
        }
      }

      console.log('✅ Vérification des URLs d\'API terminée');
    } catch (error) {
      console.error('Erreur lors de la correction des URLs:', error);
    }
  }

  // Exécuter la correction au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixApiUrls);
  } else {
    fixApiUrls();
  }
})(); 