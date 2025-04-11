/**
 * Service de gestion des performances pour NionFar
 * Fournit une interface unifiée pour accéder aux métriques de performance
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { 
  startMemoryMonitoring, 
  stopMemoryMonitoring, 
  logMemoryUsage, 
  getMemoryHistory 
} from './memory-monitor';
import { 
  startApiMetricsCollection, 
  stopApiMetricsCollection, 
  getCurrentMetrics, 
  getMetricsHistory 
} from './api-metrics';
import { 
  startHealthMonitoring, 
  stopHealthMonitoring, 
  checkSystemHealth, 
  getCurrentHealth, 
  getHealthHistory,
  addExternalService
} from './system-health';
import { 
  MemoryStats, 
  ApiMetrics, 
  SystemHealth 
} from './types';

@Injectable()
export class PerformanceService implements OnModuleInit, OnModuleDestroy {
  // Configuration des modules
  private readonly memoryMonitoringInterval = process.env.MEMORY_MONITORING_INTERVAL 
    ? parseInt(process.env.MEMORY_MONITORING_INTERVAL, 10) 
    : 30 * 60 * 1000; // Par défaut 30 minutes
  
  private readonly monitoringEnabled = process.env.ENABLE_PERFORMANCE_MONITORING 
    ? process.env.ENABLE_PERFORMANCE_MONITORING === 'true' 
    : true;
  
  constructor() {
    if (!this.monitoringEnabled) {
      console.log('Performance monitoring is disabled by configuration');
    }
  }
  
  // Initialisation au démarrage du module
  onModuleInit() {
    if (this.monitoringEnabled) {
      this.startAllMonitoring();
      this.configureExternalServices();
    }
  }
  
  // Nettoyage à l'arrêt du module
  onModuleDestroy() {
    this.stopAllMonitoring();
  }
  
  /**
   * Démarre tous les modules de surveillance
   */
  startAllMonitoring() {
    try {
      // Démarrer la surveillance de la mémoire
      startMemoryMonitoring(this.memoryMonitoringInterval);
      
      // Démarrer la collecte de métriques d'API
      startApiMetricsCollection();
      
      // Démarrer la surveillance de la santé du système
      startHealthMonitoring();
      
      console.log('✅ All performance monitoring systems started');
    } catch (error) {
      console.error('Failed to start performance monitoring', error);
    }
  }
  
  /**
   * Arrête tous les modules de surveillance
   */
  stopAllMonitoring() {
    try {
      stopMemoryMonitoring();
      stopApiMetricsCollection();
      stopHealthMonitoring();
      console.log('✅ All performance monitoring systems stopped');
    } catch (error) {
      console.error('Error stopping performance monitoring', error);
    }
  }
  
  /**
   * Configure les services externes à surveiller
   */
  private configureExternalServices() {
    // Ajouter des services à surveiller depuis la configuration
    // Exemple: API externe, service de paiement, etc.
    const serviceUrls = process.env.EXTERNAL_SERVICES_TO_MONITOR;
    
    if (serviceUrls) {
      try {
        const services = JSON.parse(serviceUrls);
        if (Array.isArray(services)) {
          services.forEach(service => {
            if (service.name && service.url) {
              addExternalService(service.name, service.url, service.timeout || 5000);
              console.log(`✅ Added external service to monitor: ${service.name}`);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing external services configuration', error);
      }
    }
  }
  
  /**
   * Récupère un tableau de bord complet des performances
   */
  async getPerformanceDashboard() {
    // Effectuer une vérification de la santé
    let health: SystemHealth | null = null;
    try {
      health = await checkSystemHealth();
    } catch (error) {
      console.error('Error checking system health', error);
      health = getCurrentHealth();
    }
    
    // Récupérer les statistiques de mémoire actuelles
    const memory = logMemoryUsage(false);
    
    // Récupérer les métriques API actuelles
    const apiMetrics = getCurrentMetrics();
    
    return {
      systemHealth: health,
      memoryStats: memory,
      apiMetrics,
      timestamp: new Date()
    };
  }
  
  /**
   * Récupère l'historique des métriques de mémoire
   */
  getMemoryHistoryData(limit?: number) {
    return getMemoryHistory().slice(-(limit || 100));
  }
  
  /**
   * Récupère l'historique des métriques d'API
   */
  getApiMetricsHistoryData(limit?: number) {
    return getMetricsHistory(limit);
  }
  
  /**
   * Récupère l'historique des vérifications de santé
   */
  getHealthHistoryData(limit?: number) {
    return getHealthHistory(limit);
  }
} 