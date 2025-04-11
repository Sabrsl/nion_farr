/**
 * Module d'optimisation automatique des performances
 * Fournit des optimisations automatiques et des suggestions
 */

import { ResourceMetric, PagePerformanceData } from './types';
import { getResourceMetrics, generateOptimizationTips, identifySlowResources } from './resourceMonitor';
import { getPageLoadMetrics, getPageLoadMetricsForPath, classifyLoadTime } from './pageLoadMonitor';
import { getStoredWebVitals } from './webVitals';

// Seuils pour le calcul du score de performance
const MAX_LOAD_TIME = 5000; // 5s est considéré comme très lent
const MAX_FCP = 2500; // 2.5s est considéré comme lent pour FCP
const MAX_LCP = 4000; // 4s est considéré comme mauvais pour LCP
const MAX_CLS = 0.25; // 0.25 est considéré comme mauvais pour CLS

// Score maximum
const MAX_PERFORMANCE_SCORE = 100;

/**
 * Calcule un score de performance (0-100) pour une page
 */
export function calculatePerformanceScore(
  loadTime: number, 
  fcp: number, 
  lcp?: number, 
  cls?: number
): number {
  // Pondération des différents facteurs
  const loadTimeWeight = 0.4;
  const fcpWeight = 0.2;
  const lcpWeight = 0.25;
  const clsWeight = 0.15;
  
  // Calculer les scores partiels (0-100)
  const loadTimeScore = Math.max(0, 100 - (loadTime / MAX_LOAD_TIME) * 100);
  const fcpScore = Math.max(0, 100 - (fcp / MAX_FCP) * 100);
  
  // Score initial sans LCP/CLS
  let score = (loadTimeScore * loadTimeWeight) + (fcpScore * fcpWeight);
  let usedWeight = loadTimeWeight + fcpWeight;
  
  // Ajouter LCP si disponible
  if (lcp !== undefined) {
    const lcpScore = Math.max(0, 100 - (lcp / MAX_LCP) * 100);
    score += lcpScore * lcpWeight;
    usedWeight += lcpWeight;
  }
  
  // Ajouter CLS si disponible
  if (cls !== undefined) {
    const clsScore = Math.max(0, 100 - (cls / MAX_CLS) * 100);
    score += clsScore * clsWeight;
    usedWeight += clsWeight;
  }
  
  // Normaliser le score en fonction des poids utilisés
  const normalizedScore = score / usedWeight;
  
  // Arrondir le score
  return Math.round(normalizedScore);
}

/**
 * Analyse les performances pour une URL spécifique
 */
export function analyzePagePerformance(url: string, pageType: string): PagePerformanceData {
  // Récupérer les données de chargement de page
  const loadMetrics = getPageLoadMetricsForPath(url);
  const latestLoadMetric = loadMetrics.length > 0 ? loadMetrics[loadMetrics.length - 1] : null;
  
  // Récupérer les métriques de ressources
  const resourceMetrics = getResourceMetrics(url);
  const slowResources = identifySlowResources(resourceMetrics);
  
  // Récupérer les Web Vitals
  const webVitalsData = getStoredWebVitals();
  const urlWebVitals = webVitalsData.filter(metric => 
    metric.pathname === url && metric.isFinal
  );
  
  // Extraire les métriques Web Vitals
  let lcp, fid, cls, ttfb;
  const webVitals = [];
  
  urlWebVitals.forEach(metric => {
    webVitals.push(metric);
    if (metric.name === 'LCP') lcp = metric.value;
    else if (metric.name === 'FID') fid = metric.value;
    else if (metric.name === 'CLS') cls = metric.value;
    else if (metric.name === 'TTFB') ttfb = metric.value;
  });
  
  // Générer des conseils d'optimisation
  const optimizationTips = generateOptimizationTips(resourceMetrics);
  
  // Ajouter des conseils spécifiques au temps de chargement
  if (latestLoadMetric) {
    const loadTimeClass = classifyLoadTime(latestLoadMetric.loadTime || latestLoadMetric.loadComplete || 0);
    
    if (loadTimeClass === 'poor') {
      optimizationTips.push(
        `Le temps de chargement de la page est lent (${latestLoadMetric.loadTime || latestLoadMetric.loadComplete}ms). ` +
        `Envisagez d'implémenter un chargement progressif et d'optimiser le code.`
      );
    }
    
    if (latestLoadMetric.ttfbTime && latestLoadMetric.ttfbTime > 500) {
      optimizationTips.push(
        `Le temps de réponse du serveur est élevé (${latestLoadMetric.ttfbTime}ms). ` +
        `Vérifiez les performances de l'API et envisagez la mise en cache.`
      );
    }
  }
  
  // Calculer le score de performance
  const performanceScore = calculatePerformanceScore(
    latestLoadMetric?.loadTime || MAX_LOAD_TIME,
    latestLoadMetric?.firstContentfulPaint || MAX_FCP,
    lcp,
    cls
  );
  
  // Créer l'objet de données de performance
  const performanceData: PagePerformanceData = {
    webVitals,
    resources: resourceMetrics,
    pageLoad: latestLoadMetric || {
      timestamp: Date.now(),
      pathname: url
    },
    performanceScore,
    slowResources: slowResources.slice(0, 5), // Limiter aux 5 ressources les plus lentes
    optimizationTips,
    timestamp: Date.now(),
    pathname: url
  };
  
  return performanceData;
}

/**
 * Applique des optimisations automatiques pour améliorer les performances
 */
export function applyAutomaticOptimizations(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // 1. Préchargement des ressources critiques
    preCacheImportantResources();
    
    // 2. Nettoyage du cache pour les anciennes ressources
    cleanupOldCachedData();
    
    // 3. Préchargement des liens visibles à l'écran
    setupLinkPrefetching();
    
    console.log('Automatic performance optimizations applied');
  } catch (error) {
    console.error('Error applying automatic optimizations:', error);
  }
}

/**
 * Précharge les ressources importantes pour les pages fréquemment visitées
 */
function preCacheImportantResources(): void {
  // Analyser l'historique des métriques pour identifier les pages fréquemment visitées
  // Cette fonction est limitée côté client sans accès aux données globales
  // Implémentation simplifiée avec préchargement statique des ressources critiques
  
  const criticalResources = [
    // Images de logo et autres ressources communes
    '/images/logo.png',
    '/images/footer-bg.jpg',
    // Polices essentielles
    '/fonts/inter-var.woff2'
  ];
  
  // Précharger les ressources via l'API Link Preload
  criticalResources.forEach(resource => {
    const extension = resource.split('.').pop();
    if (!extension) return;
    
    let as: string;
    switch (extension) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'gif':
      case 'svg':
        as = 'image';
        break;
      case 'css':
        as = 'style';
        break;
      case 'js':
        as = 'script';
        break;
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        as = 'font';
        break;
      default:
        as = 'fetch';
    }
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = as;
    
    if (as === 'font') {
      link.setAttribute('crossorigin', 'anonymous');
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Nettoie les anciennes données de cache pour éviter de surcharger localStorage
 */
function cleanupOldCachedData(): void {
  try {
    // Liste des clés de cache à nettoyer (garder seulement les X dernières entrées)
    const cacheKeys = [
      'nionfar-web-vitals',
      'nionfar-resource-metrics',
      'nionfar-page-load-metrics'
    ];
    
    cacheKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (!data) return;
      
      try {
        const parsed = JSON.parse(data);
        
        // Différentes structures selon le type de données
        if (Array.isArray(parsed)) {
          // Garder les 50 dernières entrées maximum
          if (parsed.length > 50) {
            localStorage.setItem(key, JSON.stringify(parsed.slice(-50)));
          }
        } else if (typeof parsed === 'object') {
          // Pour les objets comme les métriques de ressources
          const keys = Object.keys(parsed);
          if (keys.length > 50) {
            const newObj: Record<string, any> = {};
            keys.slice(-50).forEach(k => {
              newObj[k] = parsed[k];
            });
            localStorage.setItem(key, JSON.stringify(newObj));
          }
        }
      } catch (err) {
        // Si l'analyse échoue, supprimer l'entrée
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up cached data:', error);
  }
}

/**
 * Configure le préchargement des liens visibles à l'écran
 */
function setupLinkPrefetching(): void {
  try {
    // Observer les liens visibles dans la fenêtre
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
          const href = entry.target.href;
          
          // Ne précharger que les liens internes
          if (
            href && 
            href.startsWith(window.location.origin) && 
            !href.includes('#') && 
            href !== window.location.href
          ) {
            // Précharger le lien
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
            
            // Arrêter d'observer ce lien
            observer.unobserve(entry.target);
          }
        }
      });
    }, {
      rootMargin: '200px', // Commencer à précharger lorsque le lien est à 200px de la fenêtre
      threshold: 0.1
    });
    
    // Observer tous les liens de la page
    document.querySelectorAll('a').forEach(link => {
      if (link.href && link.href.startsWith(window.location.origin)) {
        observer.observe(link);
      }
    });
  } catch (error) {
    console.error('Error setting up link prefetching:', error);
  }
} 