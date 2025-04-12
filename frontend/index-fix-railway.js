// Script pour corriger les problèmes de connexion au backend
// Exécuter avec: node index-fix-railway.js

// Vérifier si nous sommes dans un navigateur
if (typeof window !== 'undefined') {
  console.log('🔧 Correction des problèmes de connexion au backend...');
  
  // Nettoyer les caches locaux qui pourraient contenir d'anciennes URLs
  localStorage.removeItem('backendStatus');
  localStorage.removeItem('lastBackendCheck');
  
  // Définir les nouvelles URLs
  const VERCEL_BACKEND_URL = 'https://nion-farr-backend.vercel.app';
  const VERCEL_API_URL = 'https://nion-farr-backend.vercel.app/api';
  
  // Mettre à jour les variables d'environnement locales
  localStorage.setItem('NEXT_PUBLIC_API_URL', VERCEL_API_URL);
  localStorage.setItem('NEXT_PUBLIC_APP_URL', 'https://nion-farr.vercel.app');
  
  // Si un message d'erreur est affiché indiquant que le serveur Railway est indisponible
  // Rafraîchir la page après un court délai
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
  console.log('✅ Correction terminée. Rafraîchissement de la page...');
} else {
  console.log('Ce script doit être exécuté dans un navigateur.');
} 