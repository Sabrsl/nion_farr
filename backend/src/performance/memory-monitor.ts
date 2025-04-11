/**
 * Surveillance de la mémoire pour NionFar
 * Module optimisé pour le suivi et la gestion de la mémoire du serveur
 */

import { MemoryStats } from './types';

// Seuils de mémoire pour les alertes
const MEMORY_WARNING_THRESHOLD = 75; // Alerte à 75% d'utilisation de la heap
const MEMORY_CRITICAL_THRESHOLD = 85; // Critique à 85% d'utilisation de la heap
const MEMORY_HISTORICAL_LIMIT = 100; // Nombre maximal de mesures historiques à conserver

// Intervalles et compteurs
const GC_MIN_INTERVAL = 30 * 60 * 1000; // 30 minutes minimum entre les tentatives de GC
let memoryMonitorInterval: NodeJS.Timeout | null = null;
let lastGcRequest = 0;
let cleanupAttemptsCount = 0;
const MAX_CLEANUP_ATTEMPTS = 3;

// Stockage des données historiques de mémoire
let memoryHistory: MemoryStats[] = [];

/**
 * Formate les octets en chaîne lisible
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Enregistre et analyse l'utilisation de la mémoire
 */
export function logMemoryUsage(detailed = false): MemoryStats {
  const memUsage = process.memoryUsage();
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
  const external = Math.round(memUsage.external / 1024 / 1024);
  const rss = Math.round(memUsage.rss / 1024 / 1024);
  const heapPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  
  // Création de l'objet de statistiques mémoire
  const stats: MemoryStats = {
    heapUsed,
    heapTotal,
    heapPercent,
    rss,
    external,
    timestamp: new Date()
  };
  
  // Ajouter aux données historiques
  addToMemoryHistory(stats);
  
  // Journal selon le niveau de détail demandé
  if (detailed || heapPercent > MEMORY_WARNING_THRESHOLD) {
    if (detailed) {
      console.log(`📊 Memory Usage:`);
      console.log(`  - Heap: ${heapUsed}MB / ${heapTotal}MB (${heapPercent}%)`);
      console.log(`  - RSS: ${rss}MB`);
      console.log(`  - External: ${external}MB`);
    } else {
      console.log(`📊 Heap: ${heapUsed}MB / ${heapTotal}MB (${heapPercent}%)`);
    }
  }
  
  return stats;
}

/**
 * Ajoute une mesure aux données historiques de mémoire
 */
function addToMemoryHistory(stats: MemoryStats): void {
  memoryHistory.push(stats);
  // Limiter la taille de l'historique
  if (memoryHistory.length > MEMORY_HISTORICAL_LIMIT) {
    memoryHistory = memoryHistory.slice(-MEMORY_HISTORICAL_LIMIT);
  }
}

/**
 * Récupère l'historique des mesures de mémoire
 */
export function getMemoryHistory(): MemoryStats[] {
  return [...memoryHistory];
}

/**
 * Démarre la surveillance de la mémoire
 */
export function startMemoryMonitoring(intervalMs = 30 * 60 * 1000): void {
  // Éviter les intervalles multiples
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
  }
  
  console.log('📊 Memory monitoring started (interval:', Math.round(intervalMs/1000/60), 'minutes)');
  
  // Mesure initiale
  logMemoryUsage(false);
  
  // Définir l'intervalle pour les vérifications périodiques
  memoryMonitorInterval = setInterval(() => {
    const memStats = logMemoryUsage(false);
    
    // Tentative de nettoyage uniquement si l'utilisation est très élevée
    if (memStats.heapPercent > MEMORY_CRITICAL_THRESHOLD && cleanupAttemptsCount < MAX_CLEANUP_ATTEMPTS) {
      attemptMemoryCleanup(memStats.heapPercent);
    } else {
      // Réinitialiser le compteur périodiquement
      cleanupAttemptsCount = 0;
    }
  }, intervalMs);
}

/**
 * Arrête la surveillance de la mémoire
 */
export function stopMemoryMonitoring(): void {
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
    memoryMonitorInterval = null;
    console.log('📊 Memory monitoring stopped');
  }
}

/**
 * Tentative de nettoyage de la mémoire
 */
export function attemptMemoryCleanup(heapPercent: number): void {
  const now = Date.now();
  
  // Incrémenter le compteur
  cleanupAttemptsCount++;
  
  // Journaliser les tentatives de nettoyage
  if (heapPercent > MEMORY_CRITICAL_THRESHOLD) {
    console.log(`⚠️ High memory usage: ${heapPercent}%, attempt ${cleanupAttemptsCount}/${MAX_CLEANUP_ATTEMPTS}`);
    
    // Ne pas tenter de redémarrages automatiques
    if (cleanupAttemptsCount >= MAX_CLEANUP_ATTEMPTS) {
      console.log('🔄 Maximum cleanup attempts reached, backing off until next cycle');
    }
  }
}

/**
 * Configuration de l'arrêt gracieux pour libérer les ressources
 */
export function setupGracefulShutdown(): void {
  // Gestion du signal SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Cleaning up resources...');
    stopMemoryMonitoring();
    // Permettre un peu de temps pour le nettoyage et la journalisation
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
  
  // Gestion du signal SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT received. Cleaning up resources...');
    stopMemoryMonitoring();
    // Permettre un peu de temps pour le nettoyage et la journalisation
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
  
  // Gestion des rejets non gérés
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Ne pas quitter, juste journaliser
  });
} 