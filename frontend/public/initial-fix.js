/**
 * Script d'initialisation précoce - s'exécute avant tout autre script
 * pour corriger les URLs d'API en mémoire
 */

(function() {
  try {
    console.log('🔧 INITIALISATION: Correction précoce des URLs d\'API');
    
    // Constantes pour les URLs correctes
    const VERCEL_API_URL = 'https://nion-farr-backend.vercel.app/api';
    const VERCEL_BACKEND_URL = 'https://nion-farr-backend.vercel.app';
    const VERCEL_FRONTEND_URL = 'https://nion-farr.vercel.app';
    
    // Définir les propriétés globales pour que les scripts ultérieurs puissent y accéder
    window.__CORRECT_API_URL = VERCEL_API_URL;
    window.__CORRECT_BACKEND_URL = VERCEL_BACKEND_URL;
    window.__CORRECT_FRONTEND_URL = VERCEL_FRONTEND_URL;
    
    // Fonction pour corriger le localStorage
    function fixLocalStorage() {
      try {
        // Vérifier si localStorage existe
        if (typeof localStorage === 'undefined') {
          console.warn('⚠️ localStorage non disponible');
          return false;
        }
        
        // Détecter les valeurs problématiques dans localStorage
        const apiUrl = localStorage.getItem('NEXT_PUBLIC_API_URL');
        
        // Si l'URL stockée contient railway ou render, ou si elle n'existe pas, la corriger
        if (!apiUrl || apiUrl.includes('railway') || apiUrl.includes('render')) {
          console.log('🔄 Correction de NEXT_PUBLIC_API_URL dans localStorage');
          localStorage.setItem('NEXT_PUBLIC_API_URL', VERCEL_API_URL);
          
          // Définir aussi d'autres URLs importantes
          localStorage.setItem('NEXT_PUBLIC_APP_URL', VERCEL_FRONTEND_URL);
          localStorage.setItem('apiUrl', VERCEL_API_URL);
          localStorage.setItem('backend_url', VERCEL_BACKEND_URL);
          localStorage.setItem('api_fixed', 'true');
          localStorage.setItem('api_fixed_timestamp', new Date().toISOString());
          
          return true;
        }
        
        return false;
      } catch (e) {
        console.error('❌ Erreur lors de la correction du localStorage:', e);
        return false;
      }
    }
    
    // Créer un proxy pour console.log pour intercepter et corriger dynamiquement les erreurs d'URL
    function hijackConsoleLog() {
      const originalConsoleLog = console.log;
      console.log = function() {
        // Intercepter les messages de configuration d'AuthService
        if (arguments.length > 0 && 
            typeof arguments[0] === 'string' && 
            arguments[0].includes('Configuration AuthService')) {
          
          // Forcer la correction dans localStorage
          localStorage.setItem('NEXT_PUBLIC_API_URL', window.__CORRECT_API_URL);
          
          // Si AuthService utilise encore l'ancienne URL, recharger la page
          if (arguments.length > 1 && 
              typeof arguments[1] === 'object' && 
              arguments[1].apiUrl && 
              (arguments[1].apiUrl.includes('railway') || arguments[1].apiUrl.includes('render'))) {
            
            console.error('⚠️ DÉTECTION URL OBSOLÈTE. Recharge forcée pour correction.');
            
            // Ajouter une notification visuelle
            try {
              const notification = document.createElement('div');
              notification.style = 'position: fixed; top: 20px; right: 20px; background-color: #ef4444; color: white; padding: 16px; border-radius: 4px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
              notification.textContent = '⚡ Correction d\'URL en cours... La page va se recharger automatiquement.';
              
              if (document.body) {
                document.body.appendChild(notification);
              }
            } catch (e) {}
            
            // Recharger la page après un court délai
            setTimeout(() => { 
              window.location.reload(); 
            }, 500);
          }
        }
        
        // Appeler le console.log original avec les arguments originaux
        return originalConsoleLog.apply(console, arguments);
      };
    }
    
    // Fonction pour détecter et corriger les erreurs dans le DOM
    function setupDOMObserver() {
      // Observer les changements dans le DOM pour détecter les erreurs de serveur
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            Array.from(mutation.addedNodes).forEach(function(node) {
              if (node.nodeType === 1) { // Élément
                // Rechercher les messages d'erreur dans le texte
                const text = node.textContent || '';
                if (text.includes('Serveur indisponible') || 
                    text.includes('Impossible de communiquer avec le serveur') ||
                    text.includes('nionfar.up.railway.app')) {
                  
                  // Corriger localStorage et recharger la page
                  fixLocalStorage();
                  
                  // Afficher une notification
                  console.error('⚠️ Erreur de serveur détectée dans le DOM. Correction et rechargement.');
                  
                  setTimeout(() => { window.location.reload(); }, 1000);
                }
              }
            });
          }
        });
      });
      
      // Démarrer l'observation lorsque le body est disponible
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }
    }
    
    // Exécuter les fonctions de correction
    const needsReload = fixLocalStorage();
    hijackConsoleLog();
    setupDOMObserver();
    
    // Si localStorage a été corrigé et que le document est déjà chargé, recharger la page
    if (needsReload && document.readyState === 'complete') {
      console.log('🔄 URL corrigée. Rechargement de la page...');
      setTimeout(() => { window.location.reload(); }, 100);
    }
    
    console.log('✅ Initialisation précoce terminée');
  } catch (e) {
    console.error('❌ Erreur lors de l\'initialisation précoce:', e);
  }
})(); 