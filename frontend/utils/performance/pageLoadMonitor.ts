/**
 * Module de surveillance du chargement des pages
 * Analyse et enregistre les temps de chargement des pages
 */

import { PageLoadMetrics, MetricRating } from './types';

// Clé localStorage pour les métriques de chargement de page
const PAGE_LOAD_METRICS_KEY = 'nionfar-page-load-metrics';

// Nombre maximal de métriques à stocker
const MAX_PAGE_METRICS = 50;

// Seuils de temps de chargement de page (ms)
const LOAD_TIME_GOOD = 1500;
const LOAD_TIME_MEDIUM = 3000;
const LOAD_TIME_POOR = 4500;

/**
 * Classification des temps de chargement
 */
export function classifyLoadTime(loadTime: number): MetricRating {
  if (loadTime <= LOAD_TIME_GOOD) return 'good';
  if (loadTime <= LOAD_TIME_POOR) return 'needs-improvement';
  return 'poor';
}

/**
 * Récupérer les informations de connexion de l'utilisateur si disponibles
 */
function getConnectionInfo(): string {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }

  try {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Détermine si l'utilisateur est sur un appareil mobile
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Mesure les métriques de chargement de la page actuelle
 */
export function measurePageLoad(): PageLoadMetrics | null {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  try {
    // Obtenir les entrées de navigation
    const navigationEntries = window.performance.getEntriesByType('navigation');
    if (!navigationEntries || navigationEntries.length === 0) {
      return null;
    }
    
    const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
    const paintEntries = window.performance.getEntriesByType('paint');
    
    let firstPaint = 0;
    let firstContentfulPaint = 0;
    
    // Obtenir les métriques de peinture
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        firstPaint = Math.round(entry.startTime);
      } else if (entry.name === 'first-contentful-paint') {
        firstContentfulPaint = Math.round(entry.startTime);
      }
    });
    
    // Calculer les temps de chargement
    const loadComplete = Math.round(navEntry.loadEventEnd - navEntry.startTime);
    const domContentLoaded = Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime);
    const domInteractive = Math.round(navEntry.domInteractive - navEntry.startTime);
    
    // Estimer le temps d'interactivité (approximation)
    // Dans une implémentation réelle, il faudrait utiliser la métrique TTI complète
    const timeToInteractive = Math.round(navEntry.domInteractive - navEntry.startTime);
    
    // Obtenir les informations de connexion et appareil
    const connection = getConnectionInfo();
    const isMobile = isMobileDevice();
    const pathname = window.location.pathname;
    const timestamp = Date.now();
    
    // Créer l'objet de métriques
    const metrics: PageLoadMetrics = {
      domContentLoaded,
      domInteractive,
      loadComplete,
      firstPaint,
      firstContentfulPaint,
      timeToInteractive,
      rating: classifyLoadTime(loadComplete),
      timestamp,
      pathname,
      connection,
      isMobile
    };
    
    return metrics;
  } catch (error) {
    console.error('Error measuring page load metrics:', error);
    return null;
  }
}

/**
 * Stocke les métriques de chargement de page
 */
export function storePageLoadMetrics(metrics: PageLoadMetrics): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Récupérer les métriques existantes
    const storedData = localStorage.getItem(PAGE_LOAD_METRICS_KEY);
    let metricsArray: PageLoadMetrics[] = [];
    
    if (storedData) {
      metricsArray = JSON.parse(storedData);
    }
    
    // Ajouter les nouvelles métriques
    metricsArray.push(metrics);
    
    // Limiter le nombre d'entrées
    if (metricsArray.length > MAX_PAGE_METRICS) {
      metricsArray = metricsArray.slice(-MAX_PAGE_METRICS);
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem(PAGE_LOAD_METRICS_KEY, JSON.stringify(metricsArray));
    
    // Pour le debugging
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `Page load metrics for ${metrics.pathname}: ${metrics.loadComplete}ms (${metrics.rating}), ` +
        `First Paint: ${metrics.firstPaint}ms, ` +
        `FCP: ${metrics.firstContentfulPaint}ms, ` +
        `DOM Interactive: ${metrics.domInteractive}ms`
      );
    }
  } catch (error) {
    console.error('Error storing page load metrics:', error);
  }
}

/**
 * Récupère les métriques de chargement de page stockées
 */
export function getPageLoadMetrics(): PageLoadMetrics[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(PAGE_LOAD_METRICS_KEY);
    if (!storedData) return [];
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error retrieving page load metrics:', error);
    return [];
  }
}

/**
 * Récupère les métriques de chargement pour une page spécifique
 */
export function getPageLoadMetricsForPath(pathname: string): PageLoadMetrics[] {
  const allMetrics = getPageLoadMetrics();
  return allMetrics.filter(metric => metric.pathname === pathname);
}

/**
 * Calcule le temps de chargement moyen pour une page
 */
export function getAverageLoadTimeForPath(pathname: string): number {
  const metrics = getPageLoadMetricsForPath(pathname);
  if (metrics.length === 0) return 0;
  
  const totalLoadTime = metrics.reduce((sum, metric) => sum + (metric.loadComplete || 0), 0);
  return Math.round(totalLoadTime / metrics.length);
}

/**
 * Démarre la surveillance du chargement de page
 */
export function initPageLoadMonitoring(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Mesurer au chargement complet de la page
    window.addEventListener('load', () => {
      // Différer légèrement pour obtenir des métriques plus précises
      setTimeout(() => {
        const metrics = measurePageLoad();
        if (metrics) {
          storePageLoadMetrics(metrics);
        }
      }, 100);
    });
    
    console.log('Page load monitoring initialized');
  } catch (error) {
    console.error('Error initializing page load monitoring:', error);
  }
}

/**
 * Récupère les métriques de chargement de page stockées pour la page actuelle
 */
export function getStoredPageLoadMetrics(): PageLoadMetrics | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedData = localStorage.getItem(PAGE_LOAD_METRICS_KEY);
    if (!storedData) return null;
    
    const metrics: PageLoadMetrics[] = JSON.parse(storedData);
    
    // Obtenir les métriques pour l'URL actuelle
    const currentPathname = window.location.pathname;
    const currentPageMetrics = metrics.find(m => m.pathname === currentPathname);
    
    // Si aucune métrique n'est trouvée pour la page actuelle,
    // retourner la plus récente (qui est probablement la dernière dans le tableau)
    return currentPageMetrics || metrics[metrics.length - 1] || null;
  } catch (error) {
    console.error('Error retrieving stored page load metrics:', error);
    return null;
  }
}

export default initPageLoadMonitoring; 