/**
 * Types et interfaces pour le module de performance
 */

/**
 * Statistiques de mémoire du système
 */
export interface MemoryStats {
  /** Mémoire heap utilisée en MB */
  heapUsed: number;
  /** Mémoire heap totale en MB */
  heapTotal: number;
  /** Pourcentage d'utilisation de la heap */
  heapPercent: number;
  /** Taille résidente en MB */
  rss: number;
  /** Mémoire externe en MB */
  external: number;
  /** Horodatage de la mesure */
  timestamp: Date;
}

/**
 * Statistiques de l'API
 */
export interface ApiMetrics {
  /** Nombre de requêtes par minute */
  requestsPerMinute: number;
  /** Temps de réponse moyen en ms */
  averageResponseTime: number;
  /** Nombre d'erreurs par minute */
  errorsPerMinute: number;
  /** Routes les plus sollicitées */
  topEndpoints: EndpointMetric[];
  /** Horodatage de la mesure */
  timestamp: Date;
}

/**
 * Métrique pour un endpoint spécifique
 */
export interface EndpointMetric {
  /** Chemin de l'endpoint */
  path: string;
  /** Méthode HTTP */
  method: string;
  /** Nombre de requêtes */
  count: number;
  /** Temps de réponse moyen en ms */
  averageResponseTime: number;
  /** Taux d'erreur */
  errorRate: number;
}

/**
 * Statut de santé du système
 */
export interface SystemHealth {
  /** État général du système */
  status: 'healthy' | 'degraded' | 'critical';
  /** Disponibilité du système en pourcentage */
  uptime: number;
  /** Utilisation du CPU en pourcentage */
  cpuUsage: number;
  /** État des services externes */
  externalServices: ServiceStatus[];
  /** Horodatage de la mesure */
  timestamp: Date;
}

/**
 * Statut d'un service externe
 */
export interface ServiceStatus {
  /** Nom du service */
  name: string;
  /** État du service */
  status: 'up' | 'down' | 'degraded';
  /** Temps de réponse en ms */
  responseTime: number;
} 