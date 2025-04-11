/**
 * Surveillance de la santé du système pour NionFar
 * Vérifie la santé du système et des services dépendants
 */

import * as os from 'os';
import * as mongoose from 'mongoose';
import axios from 'axios';
import { SystemHealth, ServiceStatus } from './types';

// Configuration
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // Vérifier toutes les 5 minutes
const HISTORICAL_HEALTH_LIMIT = 288; // Conserver 24h de données (288 points à 5 minutes d'intervalle)
const RESPONSE_TIME_LIMIT = 5000; // Temps de réponse maximum acceptable (ms)

// Variable de stockage des données de santé
let healthHistory: SystemHealth[] = [];
let healthCheckInterval: NodeJS.Timeout | null = null;

// Configuration des services à vérifier
interface ServiceConfig {
  name: string;
  url: string;
  timeout: number;
}

// Services externes à surveiller
const externalServices: ServiceConfig[] = [
  // Ces services peuvent être configurés dynamiquement ou via des variables d'environnement
];

/**
 * Obtient l'utilisation actuelle du CPU en pourcentage
 */
function getCpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    const startMeasure = os.cpus().map(cpu => {
      return {
        idle: cpu.times.idle,
        total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0)
      };
    });
    
    // Mesurer après un court délai
    setTimeout(() => {
      const endMeasure = os.cpus().map(cpu => {
        return {
          idle: cpu.times.idle,
          total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0)
        };
      });
      
      // Calculer l'utilisation moyenne du CPU
      const cpuUsage = startMeasure.map((start, i) => {
        const end = endMeasure[i];
        const idleDiff = end.idle - start.idle;
        const totalDiff = end.total - start.total;
        
        // Pourcentage d'utilisation
        return 100 - Math.floor(100 * idleDiff / totalDiff);
      }).reduce((acc, usage) => acc + usage, 0) / startMeasure.length;
      
      resolve(cpuUsage);
    }, 100);
  });
}

/**
 * Vérifie la disponibilité et le temps de réponse d'un service externe
 */
async function checkServiceStatus(service: ServiceConfig): Promise<ServiceStatus> {
  const startTime = Date.now();
  let status: 'up' | 'down' | 'degraded' = 'down';
  let responseTime = 0;
  
  try {
    // Effectuer la requête avec timeout
    await axios.get(service.url, { timeout: service.timeout });
    
    // Calculer le temps de réponse
    responseTime = Date.now() - startTime;
    
    // Déterminer le statut en fonction du temps de réponse
    status = responseTime < RESPONSE_TIME_LIMIT ? 'up' : 'degraded';
  } catch (error) {
    // Service inaccessible
    status = 'down';
    responseTime = service.timeout;
  }
  
  return {
    name: service.name,
    status,
    responseTime
  };
}

/**
 * Récupère l'état de santé global du système
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  // Vérifier l'utilisation du CPU
  const cpuUsage = await getCpuUsage();
  
  // Vérifier les services externes (si configurés)
  const externalServicesStatus: ServiceStatus[] = await Promise.all(
    externalServices.map(service => checkServiceStatus(service))
  );
  
  // Vérifier la connexion à la base de données
  const dbStatus: ServiceStatus = {
    name: 'MongoDB',
    status: mongoose.connection.readyState === 1 ? 'up' : 'down',
    responseTime: 0 // Non mesuré pour la connexion existante
  };
  
  // Ajouter le statut de la BD aux services
  const allServices = [dbStatus, ...externalServicesStatus];
  
  // Calculer le statut global
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  
  // Vérifier si des services critiques sont en panne
  const hasDownServices = allServices.some(service => service.status === 'down');
  if (hasDownServices) {
    status = 'critical';
  } else if (cpuUsage > 85 || allServices.some(service => service.status === 'degraded')) {
    status = 'degraded';
  }
  
  // Calculer le temps de fonctionnement en heures
  const uptime = process.uptime() / 3600;
  
  // Créer l'objet de santé
  const health: SystemHealth = {
    status,
    uptime,
    cpuUsage,
    externalServices: allServices,
    timestamp: new Date()
  };
  
  // Ajouter à l'historique et limiter la taille
  healthHistory.push(health);
  if (healthHistory.length > HISTORICAL_HEALTH_LIMIT) {
    healthHistory = healthHistory.slice(-HISTORICAL_HEALTH_LIMIT);
  }
  
  return health;
}

/**
 * Démarre la surveillance périodique de la santé du système
 */
export function startHealthMonitoring(): void {
  // Éviter les intervalles multiples
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  console.log(`📊 System health monitoring started (interval: ${HEALTH_CHECK_INTERVAL/1000/60}m)`);
  
  // Effectuer une vérification initiale
  checkSystemHealth().catch(err => {
    console.error('Error during initial health check:', err);
  });
  
  // Définir l'intervalle pour les vérifications périodiques
  healthCheckInterval = setInterval(() => {
    checkSystemHealth().catch(err => {
      console.error('Error during health check:', err);
    });
  }, HEALTH_CHECK_INTERVAL);
}

/**
 * Arrête la surveillance de la santé du système
 */
export function stopHealthMonitoring(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log('📊 System health monitoring stopped');
  }
}

/**
 * Récupère la dernière vérification de santé du système
 */
export function getCurrentHealth(): SystemHealth | null {
  return healthHistory.length > 0 ? healthHistory[healthHistory.length - 1] : null;
}

/**
 * Récupère l'historique des vérifications de santé
 */
export function getHealthHistory(limit = HISTORICAL_HEALTH_LIMIT): SystemHealth[] {
  return healthHistory.slice(-limit);
}

/**
 * Ajoute un service externe à surveiller
 */
export function addExternalService(name: string, url: string, timeout = 5000): void {
  // Éviter les doublons
  if (!externalServices.some(service => service.name === name)) {
    externalServices.push({ name, url, timeout });
  }
} 