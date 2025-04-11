/**
 * Types et interfaces pour les métriques de performance front-end
 */

/**
 * Types de métriques Web Vitals
 */
export interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  rating?: MetricRating;
}

/**
 * Niveaux de qualité des métriques
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Métriques de chargement de page
 */
export interface PageLoadMetrics {
  domContentLoaded?: number;
  domInteractive?: number;
  loadComplete?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  timeToInteractive?: number;
  rating?: MetricRating;
  timestamp: number;
  pathname: string;
  connection?: string;
  isMobile?: boolean;
  
  // Champs supplémentaires pour la compatibilité avec le composant PerformanceReport
  loadTime?: number;
  interactiveTime?: number;
  domCompleteTime?: number;
  connectionInfo?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  device?: string;
  userAgent?: string;
  dnsTime?: number;
  tcpConnectionTime?: number;
  redirectTime?: number;
  ttfbTime?: number;
}

/**
 * Métriques pour les ressources chargées
 */
export interface ResourceMetric {
  name: string;
  duration: number;
  size?: number;
  type: string;
  pathname: string;
  timestamp: number;
  isSlow: boolean;
  isLarge: boolean;
}

/**
 * Données de performance complètes de la page
 */
export interface PagePerformanceData {
  webVitals: WebVitalMetric[];
  resources: ResourceMetric[];
  pageLoad: PageLoadMetrics;
  timestamp: number;
  pathname: string;
  performanceScore: number;
  optimizationTips?: string[];
  slowResources?: ResourceMetric[];
} 