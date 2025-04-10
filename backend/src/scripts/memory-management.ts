/**
 * Memory management utilities for NionFar API
 * This script helps optimize memory usage in constrained environments like Render Free tier
 */

// Define memory thresholds
const MEMORY_WARNING_THRESHOLD = 85; // 85% heap usage triggers warning
const MEMORY_CRITICAL_THRESHOLD = 90; // 90% heap usage is critical

let memoryMonitorInterval: NodeJS.Timeout | null = null;
let lastGcRequest = 0;
const GC_MIN_INTERVAL = 5 * 60 * 1000; // Minimum 5 minutes between GC attempts

// Interface for memory usage stats
interface MemoryStats {
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
  
  if (detailed) {
    console.log(`📊 Memory Usage:`);
    console.log(`  - Heap: ${heapUsed}MB / ${heapTotal}MB (${heapPercent}%)`);
    console.log(`  - RSS: ${rss}MB`);
    console.log(`  - External: ${external}MB`);
  } else {
    if (heapPercent > MEMORY_WARNING_THRESHOLD) {
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
 * Start memory monitoring
 */
export function startMemoryMonitoring(intervalMs = 5 * 60 * 1000): void {
  // Don't start multiple intervals
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
  }
  
  console.log('📊 Starting memory monitoring (interval:', intervalMs, 'ms)');
  
  // Initial memory logging
  logMemoryUsage(true);
  
  // Set interval for periodic checks
  memoryMonitorInterval = setInterval(() => {
    const memStats = logMemoryUsage(false);
    
    // Try to clean up if memory usage is high
    if (memStats.heapPercent > MEMORY_WARNING_THRESHOLD) {
      attemptMemoryCleanup(memStats.heapPercent);
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
 * Attempt to clean up memory
 */
export function attemptMemoryCleanup(heapPercent: number): void {
  const now = Date.now();
  
  if (heapPercent > MEMORY_WARNING_THRESHOLD) {
    console.log(`⚠️ Memory warning: Heap usage at ${heapPercent}%`);
    
    // Only try to run GC if enough time has passed since last attempt
    if (global.gc && now - lastGcRequest > GC_MIN_INTERVAL) {
      console.log('🧹 Running garbage collection...');
      try {
        global.gc();
        lastGcRequest = now;
        
        // Log memory after cleanup
        setTimeout(() => {
          const memStats = logMemoryUsage(true);
          console.log(`🧹 After cleanup: Heap at ${memStats.heapPercent}%`);
        }, 1000);
      } catch (err) {
        console.error('Error running garbage collection:', err);
      }
    } else {
      console.log('⏳ GC skipped: Last GC too recent or not available');
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