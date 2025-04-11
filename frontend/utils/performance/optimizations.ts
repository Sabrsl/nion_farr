/**
 * Module d'optimisations de performance
 * Fournit des recommandations pour améliorer les performances
 */

import { PageLoadMetrics, ResourceMetric, WebVitalMetric } from './types';
import { identifySlowResources, identifyLargeResources } from './resourceMonitor';
import { getRating } from './webVitals';

/**
 * Catégories d'optimisations
 */
export type OptimizationCategory = 
  | 'assets'       // Images, vidéos, fichiers statiques
  | 'javascript'   // Scripts, bundles JS
  | 'styling'      // CSS, animations
  | 'server'       // API, SSR, backend
  | 'caching'      // Stratégies de cache
  | 'rendering'    // Composants frontend
  | 'general';     // Recommandations générales

/**
 * Recommandation d'optimisation avec détails
 */
export interface OptimizationTip {
  category: OptimizationCategory;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  relatedMetrics?: string[];
  resources?: ResourceMetric[];
}

/**
 * Génère des optimisations basées sur les métriques Web Vitals
 */
export function getWebVitalsOptimizations(webVitals: WebVitalMetric[]): OptimizationTip[] {
  const tips: OptimizationTip[] = [];
  
  // Vérifier les métriques disponibles
  const lcpMetric = webVitals.find(m => m.name === 'LCP');
  const fidMetric = webVitals.find(m => m.name === 'FID');
  const clsMetric = webVitals.find(m => m.name === 'CLS');
  const ttfbMetric = webVitals.find(m => m.name === 'TTFB');
  
  // Optimisations LCP (Largest Contentful Paint)
  if (lcpMetric && getRating(lcpMetric.name, lcpMetric.value) !== 'good') {
    tips.push({
      category: 'assets',
      title: 'Optimisez le Largest Contentful Paint (LCP)',
      description: `Votre LCP actuel est de ${Math.round(lcpMetric.value)}ms. Préchargez les images principales, optimisez leur format et leur taille, et utilisez un CDN.`,
      impact: 'high',
      effort: 'medium',
      relatedMetrics: ['LCP']
    });
    
    tips.push({
      category: 'caching',
      title: 'Utilisez du caching pour les ressources critiques',
      description: 'Implémentez une stratégie de mise en cache pour les ressources qui affectent le LCP, comme les images d\'en-tête et les styles critiques.',
      impact: 'high',
      effort: 'medium',
      relatedMetrics: ['LCP', 'TTFB']
    });
  }
  
  // Optimisations FID (First Input Delay)
  if (fidMetric && getRating(fidMetric.name, fidMetric.value) !== 'good') {
    tips.push({
      category: 'javascript',
      title: 'Réduisez le temps de blocage JavaScript',
      description: `Votre FID actuel est de ${Math.round(fidMetric.value)}ms. Fractionnez les longues tâches JS en plus petites parties et utilisez le code splitting.`,
      impact: 'high',
      effort: 'high',
      relatedMetrics: ['FID']
    });
    
    tips.push({
      category: 'javascript',
      title: 'Optimisez le chargement des scripts tiers',
      description: 'Chargez les scripts tiers de manière asynchrone ou différée pour améliorer l\'interactivité initiale de la page.',
      impact: 'medium',
      effort: 'low',
      relatedMetrics: ['FID']
    });
  }
  
  // Optimisations CLS (Cumulative Layout Shift)
  if (clsMetric && getRating(clsMetric.name, clsMetric.value) !== 'good') {
    tips.push({
      category: 'styling',
      title: 'Réduisez les changements de mise en page (CLS)',
      description: `Votre CLS actuel est de ${clsMetric.value.toFixed(3)}. Réservez de l'espace pour les images, annonces et contenu dynamique à l'avance.`,
      impact: 'medium',
      effort: 'medium',
      relatedMetrics: ['CLS']
    });
    
    tips.push({
      category: 'assets',
      title: 'Spécifiez les dimensions des images',
      description: 'Ajoutez width et height à toutes les images et éléments médias pour éviter les décalages de mise en page pendant le chargement.',
      impact: 'high',
      effort: 'low',
      relatedMetrics: ['CLS']
    });
  }
  
  // Optimisations TTFB (Time To First Byte)
  if (ttfbMetric && getRating(ttfbMetric.name, ttfbMetric.value) !== 'good') {
    tips.push({
      category: 'server',
      title: 'Améliorez le temps de réponse du serveur (TTFB)',
      description: `Votre TTFB actuel est de ${Math.round(ttfbMetric.value)}ms. Optimisez les requêtes API, utilisez le caching côté serveur et envisagez d'utiliser un CDN.`,
      impact: 'high',
      effort: 'high',
      relatedMetrics: ['TTFB']
    });
  }
  
  return tips;
}

/**
 * Génère des optimisations basées sur les métriques de ressources
 */
export function getResourceOptimizations(resources: ResourceMetric[]): OptimizationTip[] {
  const tips: OptimizationTip[] = [];
  const slowResources = identifySlowResources(resources);
  const largeResources = identifyLargeResources(resources);
  
  // Optimisations pour les images lentes/volumineuses
  const slowImages = slowResources.filter(r => r.type === 'image');
  const largeImages = largeResources.filter(r => r.type === 'image');
  
  if (slowImages.length > 0 || largeImages.length > 0) {
    tips.push({
      category: 'assets',
      title: 'Optimisez les images',
      description: `${slowImages.length} image(s) lente(s) et ${largeImages.length} image(s) volumineuse(s) détectées. Utilisez des formats modernes (WebP/AVIF), le lazy loading et des dimensions appropriées.`,
      impact: 'high',
      effort: 'medium',
      resources: [...slowImages, ...largeImages]
    });
  }
  
  // Optimisations pour les scripts lents/volumineux
  const slowScripts = slowResources.filter(r => r.type === 'script');
  const largeScripts = largeResources.filter(r => r.type === 'script');
  
  if (slowScripts.length > 0 || largeScripts.length > 0) {
    tips.push({
      category: 'javascript',
      title: 'Optimisez les scripts JavaScript',
      description: `${slowScripts.length} script(s) lent(s) et ${largeScripts.length} script(s) volumineux détectés. Utilisez le code splitting, la minification et le tree shaking.`,
      impact: 'high',
      effort: 'high',
      resources: [...slowScripts, ...largeScripts]
    });
  }
  
  // Optimisations pour les CSS lents/volumineux
  const slowStyles = slowResources.filter(r => r.type === 'style');
  const largeStyles = largeResources.filter(r => r.type === 'style');
  
  if (slowStyles.length > 0 || largeStyles.length > 0) {
    tips.push({
      category: 'styling',
      title: 'Optimisez les feuilles de style',
      description: `${slowStyles.length} style(s) lent(s) et ${largeStyles.length} style(s) volumineux détectés. Extrayez les styles critiques et chargez les styles non critiques de manière asynchrone.`,
      impact: 'medium',
      effort: 'medium',
      resources: [...slowStyles, ...largeStyles]
    });
  }
  
  // Optimisations pour les fonts
  const slowFonts = slowResources.filter(r => r.type === 'font');
  
  if (slowFonts.length > 0) {
    tips.push({
      category: 'assets',
      title: 'Optimisez les polices web',
      description: `${slowFonts.length} police(s) lente(s) détectées. Utilisez font-display: swap, préchargez les polices critiques et envisagez d'utiliser des subsets.`,
      impact: 'medium',
      effort: 'low',
      resources: slowFonts
    });
  }
  
  // Optimisations pour les API
  const slowApis = slowResources.filter(r => r.type === 'api' || r.name.includes('api') || r.name.includes('graphql'));
  
  if (slowApis.length > 0) {
    tips.push({
      category: 'server',
      title: 'Optimisez les appels API',
      description: `${slowApis.length} appel(s) API lent(s) détectés. Implémentez la mise en cache, utilisez des requêtes groupées et préchargez les données critiques.`,
      impact: 'high',
      effort: 'medium',
      resources: slowApis
    });
  }
  
  // Nombre total de requêtes
  if (resources.length > 50) {
    tips.push({
      category: 'general',
      title: 'Réduisez le nombre de requêtes HTTP',
      description: `${resources.length} requêtes détectées. Regroupez les ressources, utilisez le bundling et tirez parti de HTTP/2 pour améliorer les performances.`,
      impact: 'medium',
      effort: 'high'
    });
  }
  
  return tips;
}

/**
 * Génère des optimisations basées sur les métriques de chargement de page
 */
export function getPageLoadOptimizations(metrics: PageLoadMetrics): OptimizationTip[] {
  const tips: OptimizationTip[] = [];
  
  // Temps de chargement total
  if (metrics.loadComplete && metrics.loadComplete > 3000) {
    tips.push({
      category: 'general',
      title: 'Améliorez le temps de chargement total',
      description: `Temps de chargement actuel: ${metrics.loadComplete}ms. Optimisez les ressources critiques et implémentez le chargement progressif.`,
      impact: 'high',
      effort: 'high',
      relatedMetrics: ['loadComplete']
    });
  }
  
  // First Paint / First Contentful Paint
  if (metrics.firstContentfulPaint && metrics.firstContentfulPaint > 1500) {
    tips.push({
      category: 'rendering',
      title: 'Améliorez le First Contentful Paint',
      description: `FCP actuel: ${metrics.firstContentfulPaint}ms. Optimisez le CSS critique, réduisez les redirections et améliorez le temps de réponse du serveur.`,
      impact: 'high',
      effort: 'medium',
      relatedMetrics: ['firstContentfulPaint']
    });
  }
  
  // Time to Interactive
  if (metrics.timeToInteractive && metrics.timeToInteractive > 2500) {
    tips.push({
      category: 'javascript',
      title: 'Améliorez le Time to Interactive',
      description: `TTI actuel: ${metrics.timeToInteractive}ms. Réduisez la taille des scripts JS, différez le chargement des scripts non critiques et minimisez le travail sur le thread principal.`,
      impact: 'high',
      effort: 'high',
      relatedMetrics: ['timeToInteractive']
    });
  }
  
  // Optimisations spécifiques aux appareils mobiles
  if (metrics.isMobile) {
    tips.push({
      category: 'general',
      title: 'Optimisez pour les appareils mobiles',
      description: 'Cette page est souvent chargée sur des appareils mobiles. Assurez-vous d\'utiliser des images responsives, de réduire la taille des scripts et d\'optimiser pour les connexions lentes.',
      impact: 'high',
      effort: 'medium'
    });
  }
  
  // Optimisations basées sur la qualité de connexion
  if (metrics.connection && (metrics.connection === '2g' || metrics.connection === 'slow-2g')) {
    tips.push({
      category: 'caching',
      title: 'Optimisez pour les connexions lentes',
      description: 'Cette page est souvent chargée sur des connexions lentes. Implémentez une stratégie de mise en cache agressive et réduisez la taille totale de la page.',
      impact: 'high',
      effort: 'medium'
    });
  }
  
  return tips;
}

/**
 * Combine toutes les optimisations et les trie par impact
 */
export function getAllOptimizations(
  webVitals: WebVitalMetric[] = [],
  resources: ResourceMetric[] = [],
  pageLoad: PageLoadMetrics | null = null
): OptimizationTip[] {
  let tips: OptimizationTip[] = [];
  
  // Collecter toutes les optimisations
  tips = [
    ...getWebVitalsOptimizations(webVitals),
    ...getResourceOptimizations(resources),
    ...(pageLoad ? getPageLoadOptimizations(pageLoad) : [])
  ];
  
  // Éliminer les doublons (basés sur le titre)
  const uniqueTips = tips.reduce((acc, tip) => {
    if (!acc.find(t => t.title === tip.title)) {
      acc.push(tip);
    }
    return acc;
  }, [] as OptimizationTip[]);
  
  // Trier par impact (high → medium → low)
  const sortedTips = uniqueTips.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
  
  return sortedTips;
} 