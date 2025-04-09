/**
 * FICHIER DÉSACTIVÉ EN PRODUCTION
 * 
 * Ce fichier initialisait Mock Service Worker pour le développement.
 * Il a été désactivé en environnement de production pour éviter l'utilisation 
 * de données fictives.
 */

async function initMSW() {
  // Mock Service Worker est désactivé en production
  console.log('%c[API] Using real backend API only', 'color: green; font-weight: bold;');
  return false;
}

export default initMSW; 