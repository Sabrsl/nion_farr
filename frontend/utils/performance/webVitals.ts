/**
 * Module de collecte des métriques Web Vitals
 * Basé sur Next.js Web Vitals et adapté pour NionFar
 */

import { onLCP, onFID, onCLS, onTTFB, Metric } from 'web-vitals';
import { WebVitalMetric, MetricRating } from './types';

// Seuils pour les métriques Web Vitals (basés sur les recommandations de Google)
const LCP_THRESHOLD_GOOD = 2500; // ms
const LCP_THRESHOLD_POOR = 4000; // ms
const FID_THRESHOLD_GOOD = 100; // ms
const FID_THRESHOLD_POOR = 300; // ms
const CLS_THRESHOLD_GOOD = 0.1;
const CLS_THRESHOLD_POOR = 0.25;
const TTFB_THRESHOLD_GOOD = 800; // ms
const TTFB_THRESHOLD_POOR = 1800; // ms

// Nombre maximal de métriques à stocker en local
const MAX_LOCAL_METRICS = 50;

// Clé localStorage pour les métriques Web Vitals
const WEB_VITALS_STORAGE_KEY = 'nionfar-web-vitals';

/**
 * Obtient la classification d'une métrique de performance selon les seuils de Google
 */
export function getRating(name: string, value: number): MetricRating {
  switch (name) {
    case 'LCP':
      return value <= LCP_THRESHOLD_GOOD
        ? 'good'
        : value <= LCP_THRESHOLD_POOR
        ? 'needs-improvement'
        : 'poor';
    case 'FID':
      return value <= FID_THRESHOLD_GOOD
        ? 'good'
        : value <= FID_THRESHOLD_POOR
        ? 'needs-improvement'
        : 'poor';
    case 'CLS':
      return value <= CLS_THRESHOLD_GOOD
        ? 'good'
        : value <= CLS_THRESHOLD_POOR
        ? 'needs-improvement'
        : 'poor';
    case 'TTFB':
      return value <= TTFB_THRESHOLD_GOOD
        ? 'good'
        : value <= TTFB_THRESHOLD_POOR
        ? 'needs-improvement'
        : 'poor';
    default:
      return 'needs-improvement';
  }
}

/**
 * Convertit une métrique web-vitals en WebVitalMetric
 */
function convertMetric(metric: Metric): WebVitalMetric {
  const webVitalMetric = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta || 0,
    entries: metric.entries as PerformanceEntry[]
  };
  
  // Ajouter la propriété rating
  const rating = getRating(metric.name, metric.value);
  
  return {
    ...webVitalMetric,
    rating
  };
}

/**
 * Envoie les métriques Web Vitals à un point d'API ou au stockage local
 */
async function sendWebVitals(metric: Metric) {
  // Convertir la métrique au format attendu
  const webVitalMetric = convertMetric(metric);
  
  // Si nous sommes côté client, stocker localement
  if (typeof window !== 'undefined') {
    try {
      // Récupérer les métriques existantes
      const storedMetrics = localStorage.getItem(WEB_VITALS_STORAGE_KEY);
      const metrics = storedMetrics ? JSON.parse(storedMetrics) : [];
      
      // Ajouter la nouvelle métrique
      metrics.push({
        ...webVitalMetric,
        pathname: window.location.pathname,
        rating: getRating(webVitalMetric.name, webVitalMetric.value),
        timestamp: Date.now()
      });
      
      // Limiter le nombre de métriques stockées
      const trimmedMetrics = metrics.slice(-MAX_LOCAL_METRICS);
      
      // Sauvegarder dans localStorage
      localStorage.setItem(WEB_VITALS_STORAGE_KEY, JSON.stringify(trimmedMetrics));
      
      // Envoyer les métriques à l'API en arrière-plan (si connecté)
      if (process.env.NODE_ENV === 'production') {
        const token = localStorage.getItem('token');
        if (token) {
          navigator.sendBeacon(
            '/api/metrics/web-vitals',
            JSON.stringify({
              metric: webVitalMetric,
              pathname: window.location.pathname,
              rating: getRating(webVitalMetric.name, webVitalMetric.value),
              timestamp: Date.now()
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to store web vitals:', error);
    }
  }
}

/**
 * Récupère les métriques Web Vitals stockées localement
 */
export function getStoredWebVitals() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedMetrics = localStorage.getItem(WEB_VITALS_STORAGE_KEY);
    return storedMetrics ? JSON.parse(storedMetrics) : [];
  } catch (error) {
    console.error('Failed to retrieve web vitals:', error);
    return [];
  }
}

/**
 * Démarrer la collecte des métriques Web Vitals
 */
export function initWebVitals() {
  try {
    // Ne collecter que dans l'environnement client
    if (typeof window !== 'undefined') {
      // Collecter LCP (Largest Contentful Paint)
      onLCP((metric) => {
        sendWebVitals(metric);
      });
      
      // Collecter FID (First Input Delay)
      onFID((metric) => {
        sendWebVitals(metric);
      });
      
      // Collecter CLS (Cumulative Layout Shift)
      onCLS((metric) => {
        sendWebVitals(metric);
      });
      
      // Collecter TTFB (Time to First Byte)
      onTTFB((metric) => {
        sendWebVitals(metric);
      });
      
      console.log('Web Vitals monitoring initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

export default initWebVitals; 