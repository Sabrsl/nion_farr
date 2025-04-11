/**
 * Module de surveillance des ressources
 * Analyse les performances de chargement des ressources
 */

import { ResourceMetric } from './types';

// Seuils de performance pour les ressources
const SLOW_RESOURCE_THRESHOLD = 500; // ms
const VERY_SLOW_RESOURCE_THRESHOLD = 1000; // ms
const LARGE_RESOURCE_THRESHOLD = 500 * 1024; // 500KB

// Nombre maximal de ressources à stocker en local
const MAX_RESOURCE_ENTRIES = 100;

// Clé localStorage pour les métriques de ressources
const RESOURCE_METRICS_STORAGE_KEY = 'nionfar-resource-metrics';

/**
 * Collecte les métriques de toutes les ressources chargées
 */
export function collectResourceMetrics(): ResourceMetric[] {
  if (typeof window === 'undefined' || !window.performance || !window.performance.getEntriesByType) {
    return [];
  }

  try {
    // Récupérer toutes les entrées de ressources
    const resourceEntries = window.performance.getEntriesByType('resource');
    const pathname = window.location.pathname;
    const timestamp = Date.now();
    
    // Transformer et filtrer les entrées
    const resourceMetrics: ResourceMetric[] = resourceEntries.map(entry => {
      const resourceEntry = entry as PerformanceResourceTiming;
      // Déterminer le type de ressource à partir de l'URL
      const url = resourceEntry.name;
      let type = 'other';
      
      if (url.match(/\.(js|jsx|ts|tsx)(\?|$)/)) type = 'script';
      else if (url.match(/\.(css)(\?|$)/)) type = 'style';
      else if (url.match(/\.(jpe?g|png|gif|svg|webp)(\?|$)/)) type = 'image';
      else if (url.match(/\.(woff2?|ttf|otf|eot)(\?|$)/)) type = 'font';
      else if (url.match(/\.(json)(\?|$)/)) type = 'json';
      else if (url.includes('/api/')) type = 'api';
      
      const size = resourceEntry.transferSize || 0;
      const duration = Math.round(resourceEntry.duration);
      
      return {
        name: url.split('/').pop()?.split('?')[0] || url,
        type,
        size,
        duration,
        pathname,
        timestamp,
        isSlow: duration > SLOW_RESOURCE_THRESHOLD,
        isLarge: size > LARGE_RESOURCE_THRESHOLD
      };
    });
    
    return resourceMetrics;
  } catch (error) {
    console.error('Error collecting resource metrics:', error);
    return [];
  }
}

/**
 * Identifie les ressources lentes
 */
export function identifySlowResources(resources: ResourceMetric[]): ResourceMetric[] {
  return resources.filter(resource => resource.isSlow)
    .sort((a, b) => b.duration - a.duration);
}

/**
 * Identifie les ressources volumineuses
 */
export function identifyLargeResources(resources: ResourceMetric[]): ResourceMetric[] {
  return resources.filter(resource => resource.isLarge)
    .sort((a, b) => (b.size || 0) - (a.size || 0));
}

/**
 * Génère des recommandations d'optimisation basées sur les ressources problématiques
 */
export function generateOptimizationTips(resources: ResourceMetric[]): string[] {
  const tips: string[] = [];
  const slowResources = identifySlowResources(resources);
  const largeResources = identifyLargeResources(resources);
  
  // Regrouper les ressources par type
  const slowByType: Record<string, ResourceMetric[]> = {};
  const largeByType: Record<string, ResourceMetric[]> = {};
  
  slowResources.forEach(res => {
    if (!slowByType[res.type]) slowByType[res.type] = [];
    slowByType[res.type].push(res);
  });
  
  largeResources.forEach(res => {
    if (!largeByType[res.type]) largeByType[res.type] = [];
    largeByType[res.type].push(res);
  });
  
  // Générer des conseils pour les images
  if (slowByType.image && slowByType.image.length > 0) {
    tips.push(`Optimisez ${slowByType.image.length} image${slowByType.image.length > 1 ? 's' : ''} lente${slowByType.image.length > 1 ? 's' : ''} en utilisant des formats modernes (WebP/AVIF) et le lazy loading.`);
  }
  
  if (largeByType.image && largeByType.image.length > 0) {
    tips.push(`Compressez ${largeByType.image.length} image${largeByType.image.length > 1 ? 's' : ''} volumineuse${largeByType.image.length > 1 ? 's' : ''} ou utilisez des images adaptatives (srcset).`);
  }
  
  // Générer des conseils pour les scripts
  if (slowByType.script && slowByType.script.length > 0) {
    tips.push(`Optimisez les scripts lents en utilisant le code splitting ou en les chargeant de manière asynchrone.`);
  }
  
  if (largeByType.script && largeByType.script.length > 0) {
    tips.push(`Réduisez la taille des scripts JS en utilisant tree-shaking et minification.`);
  }
  
  // Générer des conseils pour les styles
  if (slowByType.style || largeByType.style) {
    tips.push(`Optimisez les CSS en éliminant les styles inutilisés et en différant le chargement des styles non critiques.`);
  }
  
  // Générer des conseils pour les API
  if (slowByType.api && slowByType.api.length > 0) {
    tips.push(`Améliorez la performance des appels API en implémentant la mise en cache et la prélecture des données.`);
  }
  
  // Conseils généraux
  if (resources.length > 50) {
    tips.push(`Réduisez le nombre total de requêtes en regroupant les ressources ou en utilisant HTTP/2.`);
  }
  
  return tips;
}

/**
 * Stocke les métriques de ressources dans localStorage
 */
export function storeResourceMetrics(pathname: string, resources: ResourceMetric[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Récupérer les métriques existantes
    const storedData = localStorage.getItem(RESOURCE_METRICS_STORAGE_KEY);
    let metricsMap: Record<string, { timestamp: number, resources: ResourceMetric[] }> = {};
    
    if (storedData) {
      metricsMap = JSON.parse(storedData);
    }
    
    // Ajouter les nouvelles métriques
    metricsMap[pathname] = {
      timestamp: Date.now(),
      resources
    };
    
    // Limiter le nombre d'entrées
    const urlKeys = Object.keys(metricsMap);
    if (urlKeys.length > MAX_RESOURCE_ENTRIES) {
      // Supprimer les entrées les plus anciennes
      const sortedKeys = urlKeys.sort((a, b) => metricsMap[a].timestamp - metricsMap[b].timestamp);
      const keysToRemove = sortedKeys.slice(0, urlKeys.length - MAX_RESOURCE_ENTRIES);
      keysToRemove.forEach(key => {
        delete metricsMap[key];
      });
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem(RESOURCE_METRICS_STORAGE_KEY, JSON.stringify(metricsMap));
  } catch (error) {
    console.error('Error storing resource metrics:', error);
  }
}

/**
 * Récupère les métriques de ressources pour une URL spécifique
 */
export function getResourceMetrics(targetPathname?: string): ResourceMetric[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(RESOURCE_METRICS_STORAGE_KEY);
    if (!storedData) return [];
    
    const metricsMap = JSON.parse(storedData);
    
    if (targetPathname) {
      return metricsMap[targetPathname]?.resources || [];
    }
    
    // Obtenir les métriques pour l'URL actuelle
    const currentPathname = window.location.pathname;
    return metricsMap[currentPathname]?.resources || [];
  } catch (error) {
    console.error('Error retrieving resource metrics:', error);
    return [];
  }
}

/**
 * Récupère toutes les métriques de ressources stockées
 */
export function getStoredResourceMetrics(): ResourceMetric[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(RESOURCE_METRICS_STORAGE_KEY);
    if (!storedData) return [];
    
    const metricsMap = JSON.parse(storedData);
    
    // Fusionner toutes les ressources de toutes les pages
    const allResources: ResourceMetric[] = [];
    Object.values(metricsMap).forEach((entry: any) => {
      if (entry.resources && Array.isArray(entry.resources)) {
        allResources.push(...entry.resources);
      }
    });
    
    return allResources;
  } catch (error) {
    console.error('Error retrieving all resource metrics:', error);
    return [];
  }
}

/**
 * Génère des conseils d'optimisation basés sur les ressources problématiques
 */
export function getResourceOptimizationTips(resources: ResourceMetric[]): string[] {
  // Utiliser la fonction generateOptimizationTips existante
  return generateOptimizationTips(resources);
}

/**
 * Analyse les ressources chargées et stocke les métriques
 */
export function analyzePageResources(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Attendre que la page soit complètement chargée
    if (document.readyState === 'complete') {
      performAnalysis();
    } else {
      window.addEventListener('load', () => {
        // Attendre un peu après le chargement pour capturer toutes les ressources
        setTimeout(performAnalysis, 300);
      });
    }
  } catch (error) {
    console.error('Error initiating resource analysis:', error);
  }
}

/**
 * Exécute l'analyse des ressources
 */
function performAnalysis(): void {
  try {
    const resources = collectResourceMetrics();
    const currentPathname = window.location.pathname;
    
    // Stocker les métriques
    storeResourceMetrics(currentPathname, resources);
    
    // Analyser et générer des recommandations
    const slowResources = identifySlowResources(resources);
    if (slowResources.length > 0) {
      console.debug(`Found ${slowResources.length} slow resources on ${currentPathname}`);
    }
    
    const largeResources = identifyLargeResources(resources);
    if (largeResources.length > 0) {
      console.debug(`Found ${largeResources.length} large resources on ${currentPathname}`);
    }
  } catch (error) {
    console.error('Error performing resource analysis:', error);
  }
} 