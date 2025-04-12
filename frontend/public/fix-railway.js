// Script de correction des problèmes de connexion au backend
(function() {
  console.log('🔧 Exécution du script de correction backend...');
  
  // Définir les URLs Vercel
  const VERCEL_BACKEND_URL = 'https://nion-farr-backend.vercel.app';
  const VERCEL_API_URL = 'https://nion-farr-backend.vercel.app/api';
  const VERCEL_FRONTEND_URL = 'https://nion-farr.vercel.app';
  
  // Nettoyer les valeurs liées à l'ancien backend
  function cleanStoredValues() {
    console.log('🧹 Nettoyage des valeurs stockées...');
    
    // Liste des clés à nettoyer
    const keysToClean = [
      'backendStatus',
      'lastBackendCheck',
      'NEXT_PUBLIC_API_URL',
      'apiUrl',
      'backend_url'
    ];
    
    // Vider completement le localStorage pour être sûr
    try {
      localStorage.clear();
      console.log('✅ localStorage entièrement vidé');
    } catch (e) {
      console.error('❌ Erreur lors du nettoyage du localStorage:', e);
    }
    
    // Définir les nouvelles valeurs
    try {
      localStorage.setItem('NEXT_PUBLIC_API_URL', VERCEL_API_URL);
      localStorage.setItem('NEXT_PUBLIC_APP_URL', VERCEL_FRONTEND_URL);
      localStorage.setItem('backend_fixed', 'true');
      localStorage.setItem('backend_fix_timestamp', new Date().toISOString());
      localStorage.setItem('backend_provider', 'vercel');
      console.log('✅ Nouvelles valeurs définies');
    } catch (e) {
      console.error('❌ Erreur lors de la définition des nouvelles valeurs:', e);
    }
  }
  
  // Vérifier si une erreur de Railway est présente sur la page
  function checkForRailwayError() {
    console.log('🔍 Recherche d\'erreurs Railway ou de backend...');
    
    // Vérifier le contenu de la page
    const pageContent = document.body.textContent || '';
    const errorMessages = [
      'railway.app',
      'nionfar.up.railway',
      'Serveur indisponible',
      'Railway indisponible'
    ];
    
    // Chercher les messages d'erreur
    let errorFound = false;
    errorMessages.forEach(msg => {
      if (pageContent.includes(msg)) {
        console.log(`⚠️ Erreur trouvée: "${msg}"`);
        errorFound = true;
      }
    });
    
    // Forcer la détection d'erreur pour assurer la migration vers Vercel
    if (!errorFound) {
      console.log('⚠️ Forçage de la migration vers Vercel');
      errorFound = true;
    }
    
    return errorFound;
  }
  
  // Corriger les références à Railway dans le DOM
  function fixDomReferences() {
    console.log('🔧 Correction des références dans le DOM...');
    
    // Rechercher toutes les références textuelles à Railway
    const textNodes = [];
    function findTextNodes(node) {
      if (node.nodeType === 3) {
        // Node de type texte
        if (node.nodeValue.includes('railway') || node.nodeValue.includes('Serveur indisponible')) {
          textNodes.push(node);
        }
      } else if (node.nodeType === 1) {
        // Élément
        Array.from(node.childNodes).forEach(findTextNodes);
      }
    }
    
    findTextNodes(document.body);
    
    // Remplacer les références trouvées
    textNodes.forEach(node => {
      node.nodeValue = node.nodeValue
        .replace(/https?:\/\/[^\/]*railway\.app[^\/]*\/api/gi, VERCEL_API_URL)
        .replace(/https?:\/\/[^\/]*railway\.app[^\/]*/gi, VERCEL_BACKEND_URL)
        .replace(/Serveur indisponible \(.*\)/gi, 'Connexion au serveur en cours...');
    });
    
    console.log(`✅ ${textNodes.length} références corrigées dans le DOM`);
  }
  
  // Exécuter les réparations
  function runFix() {
    cleanStoredValues();
    
    const errorFound = checkForRailwayError();
    if (errorFound) {
      fixDomReferences();
      
      // Ajouter une notification visuelle
      try {
        const notification = document.createElement('div');
        notification.style = 'position: fixed; top: 20px; right: 20px; background-color: #4CAF50; color: white; padding: 16px; border-radius: 4px; z-index: 9999;';
        notification.textContent = 'Migration vers Vercel en cours... La page va se recharger automatiquement.';
        document.body.appendChild(notification);
      } catch (e) {
        console.error('Erreur lors de l\'affichage de la notification:', e);
      }
      
      // Rafraîchir la page après un court délai
      setTimeout(() => {
        console.log('🔄 Rechargement de la page');
        window.location.reload();
      }, 1500);
    }
  }
  
  // Exécuter immédiatement
  runFix();
})(); 