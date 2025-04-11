/**
 * API de performances pour NionFar frontend
 * Fournit des outils pour mesurer, analyser et optimiser les performances
 */

// Types
export * from './types';

// Web Vitals
export { default as initWebVitals, getStoredWebVitals, getRating } from './webVitals';

// Surveillance des ressources
export {
  collectResourceMetrics,
  identifySlowResources,
  identifyLargeResources,
  generateOptimizationTips,
  getResourceMetrics,
  analyzePageResources,
} from './resourceMonitor';

// Surveillance du chargement de page
export {
  default as initPageLoadMonitoring,
  measurePageLoad,
  getPageLoadMetrics,
  getPageLoadMetricsForPath,
  getAverageLoadTimeForPath,
  classifyLoadTime,
} from './pageLoadMonitor';

// Optimisations
export {
  analyzePagePerformance,
  calculatePerformanceScore,
  applyAutomaticOptimizations,
} from './optimizer';

/**
 * Initialise le système complet de surveillance des performances
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  try {
    // Initialiser les modules de surveillance
    const init = async () => {
      // Initialiser le suivi des Web Vitals
      const { default: initWebVitals } = await import('./webVitals');
      initWebVitals();
      
      // Initialiser la surveillance du chargement de page
      const { default: initPageLoadMonitoring } = await import('./pageLoadMonitor');
      initPageLoadMonitoring();
      
      // Initialiser l'analyse des ressources
      const { analyzePageResources } = await import('./resourceMonitor');
      analyzePageResources();
      
      // Appliquer les optimisations automatiques
      const { applyAutomaticOptimizations } = await import('./optimizer');
      applyAutomaticOptimizations();
      
      console.log('✅ Performance monitoring system initialized');
    };
    
    // Si le document est déjà chargé, initialiser immédiatement
    if (document.readyState === 'complete') {
      init();
    } else {
      // Sinon, attendre que la page soit chargée
      window.addEventListener('load', init);
    }
  } catch (error) {
    console.error('Error initializing performance monitoring:', error);
  }
}

// Offrir une initialisation par défaut
export default initPerformanceMonitoring; 