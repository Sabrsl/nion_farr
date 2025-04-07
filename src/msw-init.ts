// Ce fichier initialise Mock Service Worker uniquement en environnement de développement

async function initMSW() {
  // Vérifier si nous sommes en développement
  if (process.env.NODE_ENV === 'development') {
    // Importer dynamiquement le worker MSW
    const { worker } = await import('../mocks/browser');
    
    // Démarrer le worker avec logging minimal en production
    await worker.start({
      onUnhandledRequest: 'bypass', // Ne pas logger les requêtes non interceptées
    });
    
    console.log('%c[MSW] Initialized - Mock API active', 'color: purple; font-weight: bold;');
  }
}

export default initMSW;