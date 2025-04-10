/**
 * Memory management utilities for NionFar API
 * This script helps optimize memory usage in constrained environments like Render Free tier
 */

// Define memory thresholds - lowered to prevent constant cleanup cycles
const MEMORY_WARNING_THRESHOLD = 75; // 75% heap usage triggers warning
const MEMORY_CRITICAL_THRESHOLD = 85; // 85% heap usage is critical

let memoryMonitorInterval: NodeJS.Timeout | null = null;
let lastGcRequest = 0;
// Increase minimum interval between GC attempts to reduce pressure
const GC_MIN_INTERVAL = 30 * 60 * 1000; // Minimum 30 minutes between GC attempts

// Track cleanup attempts to prevent infinite loops
let cleanupAttemptsCount = 0;
const MAX_CLEANUP_ATTEMPTS = 3; // Maximum cleanup attempts before backing off

// Interface for memory usage stats
export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  heapPercent: number;
  rss: number;
  external: number;
}

/**
 * Format bytes to a human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Log memory usage levels
 */
export function logMemoryUsage(detailed = false): MemoryStats {
  const memUsage = process.memoryUsage();
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
  const external = Math.round(memUsage.external / 1024 / 1024);
  const rss = Math.round(memUsage.rss / 1024 / 1024);
  const heapPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  
  // Only log if detailed is requested or if heap usage is high
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
  
  return {
    heapUsed,
    heapTotal,
    heapPercent,
    rss,
    external
  };
}

/**
 * Start memory monitoring with less frequent checks
 */
export function startMemoryMonitoring(intervalMs = 30 * 60 * 1000): void {
  // Don't start multiple intervals
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
  }
  
  console.log('📊 Memory monitoring started (interval:', Math.round(intervalMs/1000/60), 'minutes)');
  
  // Initial memory logging - with less detail to save log space
  logMemoryUsage(false);
  
  // Set interval for periodic checks - much less frequent
  memoryMonitorInterval = setInterval(() => {
    const memStats = logMemoryUsage(false);
    
    // Only try to clean up if memory usage is very high and we haven't tried too many times
    if (memStats.heapPercent > MEMORY_CRITICAL_THRESHOLD && cleanupAttemptsCount < MAX_CLEANUP_ATTEMPTS) {
      attemptMemoryCleanup(memStats.heapPercent);
    } else {
      // Reset cleanup counter periodically to allow future cleanup attempts
      cleanupAttemptsCount = 0;
    }
  }, intervalMs);
}

/**
 * Stop memory monitoring
 */
export function stopMemoryMonitoring(): void {
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
    memoryMonitorInterval = null;
    console.log('📊 Memory monitoring stopped');
  }
}

/**
 * Attempt to clean up memory - simplified and less aggressive
 */
export function attemptMemoryCleanup(heapPercent: number): void {
  const now = Date.now();
  
  // Increment counter
  cleanupAttemptsCount++;
  
  // Only log cleanup attempts, don't perform expensive operations
  if (heapPercent > MEMORY_CRITICAL_THRESHOLD) {
    console.log(`⚠️ High memory usage: ${heapPercent}%, attempt ${cleanupAttemptsCount}/${MAX_CLEANUP_ATTEMPTS}`);
    
    // Don't attempt automatic restarts as they cause more issues
    if (cleanupAttemptsCount >= MAX_CLEANUP_ATTEMPTS) {
      console.log('🔄 Maximum cleanup attempts reached, backing off until next cycle');
    }
  }
}

/**
 * Setup handlers for graceful shutdown to release resources
 */
export function setupGracefulShutdown(): void {
  // Handle SIGTERM signal
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Cleaning up resources...');
    stopMemoryMonitoring();
    // Allow some time for cleanup and logging
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
  
  // Handle SIGINT signal (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT received. Cleaning up resources...');
    stopMemoryMonitoring();
    // Allow some time for cleanup and logging
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
  
  // Unhandled rejection handling
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit, just log it
  });
} 