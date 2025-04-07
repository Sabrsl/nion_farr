// Ce fichier initialise Mock Service Worker uniquement en environnement de développement

async function initMSW() {
  // Vérifier si nous sommes en développement et si les mocks sont activés
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

  if (process.env.NODE_ENV === 'development' && useMocks) {
    try {
      // Importer dynamiquement le worker MSW
      const { worker } = await import('../mocks/browser');
      
      // Démarrer le worker avec logging minimal
      await worker.start({
        onUnhandledRequest: 'bypass', // Ne pas logger les requêtes non interceptées
      });
      
      console.log('%c[MSW] Initialized - Mock API active', 'color: purple; font-weight: bold;');
    } catch (error) {
      console.error('[MSW] Failed to initialize:', error);
    }
  } else {
    console.log('%c[API] Using real backend API', 'color: green; font-weight: bold;');
  }
}

export default initMSW; 