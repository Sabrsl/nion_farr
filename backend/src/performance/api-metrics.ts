/**
 * Métriques d'API pour NionFar
 * Module de collecte et d'analyse des métriques de performance API
 */

import { Request, Response, NextFunction } from 'express';
import { ApiMetrics, EndpointMetric } from './types';

// Configuration
const METRICS_COLLECTION_INTERVAL = 60 * 1000; // Collecter les données toutes les minutes
const HISTORICAL_METRICS_LIMIT = 1440; // Conserver 24h de données (1440 minutes)
const TOP_ENDPOINTS_LIMIT = 10; // Nombre d'endpoints à suivre dans les métriques détaillées

// Variables de stockage des métriques
let requestCount = 0;
let errorCount = 0;
let totalResponseTime = 0;
let endpointMetrics: Record<string, EndpointMetric> = {};
let metricsHistory: ApiMetrics[] = [];
let metricsInterval: NodeJS.Timeout | null = null;

/**
 * Middleware pour collecter les métriques de requêtes API
 */
export function apiMetricsMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ignorer les requêtes pour les ressources statiques et la santé
    if (req.path.startsWith('/public') || req.path.startsWith('/assets') || req.path === '/health') {
      return next();
    }

    const startTime = Date.now();
    
    // Augmenter le compteur de requêtes
    requestCount++;
    
    // Intercepter la fin de la réponse pour mesurer le temps
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;
      
      // Identifier l'endpoint (méthode + chemin)
      const endpoint = `${req.method} ${req.route?.path || req.path}`;
      
      // Vérifier s'il s'agit d'une erreur (statut >= 400)
      const isError = res.statusCode >= 400;
      if (isError) {
        errorCount++;
      }
      
      // Mettre à jour les métriques de l'endpoint
      updateEndpointMetrics(endpoint, responseTime, isError);
    });
    
    next();
  };
}

/**
 * Mise à jour des métriques pour un endpoint spécifique
 */
function updateEndpointMetrics(path: string, responseTime: number, isError: boolean): void {
  // Créer l'entrée si elle n'existe pas
  if (!endpointMetrics[path]) {
    const [method, route] = path.split(' ');
    endpointMetrics[path] = {
      path: route,
      method,
      count: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
  }
  
  // Mettre à jour les métriques
  const metric = endpointMetrics[path];
  const oldTotalTime = metric.averageResponseTime * metric.count;
  metric.count++;
  
  // Recalculer la moyenne du temps de réponse
  metric.averageResponseTime = (oldTotalTime + responseTime) / metric.count;
  
  // Mettre à jour le taux d'erreur
  if (isError) {
    metric.errorRate = ((metric.errorRate * (metric.count - 1)) + 1) / metric.count;
  }
}

/**
 * Collecter et stocker les métriques courantes
 */
function collectCurrentMetrics(): ApiMetrics {
  // Calculer les métriques globales
  const averageResponseTime = requestCount > 0 ? totalResponseTime / requestCount : 0;
  
  // Trier les endpoints par nombre de requêtes et prendre les N principaux
  const topEndpoints = Object.values(endpointMetrics)
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_ENDPOINTS_LIMIT);
  
  // Créer l'objet de métriques
  const metrics: ApiMetrics = {
    requestsPerMinute: requestCount,
    averageResponseTime,
    errorsPerMinute: errorCount,
    topEndpoints,
    timestamp: new Date()
  };
  
  // Ajouter à l'historique et limiter la taille
  metricsHistory.push(metrics);
  if (metricsHistory.length > HISTORICAL_METRICS_LIMIT) {
    metricsHistory = metricsHistory.slice(-HISTORICAL_METRICS_LIMIT);
  }
  
  // Réinitialiser les compteurs
  requestCount = 0;
  errorCount = 0;
  totalResponseTime = 0;
  endpointMetrics = {};
  
  return metrics;
}

/**
 * Démarre la collecte périodique des métriques
 */
export function startApiMetricsCollection(): void {
  // Éviter les intervalles multiples
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }
  
  console.log(`📊 API metrics collection started (interval: ${METRICS_COLLECTION_INTERVAL/1000}s)`);
  
  // Définir l'intervalle pour les collections périodiques
  metricsInterval = setInterval(() => {
    collectCurrentMetrics();
  }, METRICS_COLLECTION_INTERVAL);
}

/**
 * Arrête la collecte des métriques
 */
export function stopApiMetricsCollection(): void {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
    console.log('📊 API metrics collection stopped');
  }
}

/**
 * Récupère les métriques API les plus récentes
 */
export function getCurrentMetrics(): ApiMetrics | null {
  return metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : null;
}

/**
 * Récupère l'historique des métriques API
 */
export function getMetricsHistory(limit = HISTORICAL_METRICS_LIMIT): ApiMetrics[] {
  return metricsHistory.slice(-limit);
} 