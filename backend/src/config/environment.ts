/**
 * Environment configuration utilities
 * Provides functions to check environment and memory optimization settings
 */

/**
 * Checks if the application is running in a memory-constrained environment
 * This is determined by either:
 * 1. The MEMORY_OPTIMIZED env var being set to 'true'
 * 2. The NODE_OPTIONS containing a small heap size limit (128MB)
 * 3. Running in production mode on Render's free tier
 */
export const isMemoryConstrainedEnvironment = (): boolean => {
  // Check for explicit memory optimization flag
  const memoryOptimized = process.env.MEMORY_OPTIMIZED === 'true';
  
  // Check for small heap size in NODE_OPTIONS
  const hasSmallHeapSize = process.env.NODE_OPTIONS?.includes('--max-old-space-size=128');
  
  // Check for Render free tier
  const isRenderFreeTier = process.env.IS_RENDER === 'true' && 
    process.env.RENDER_SERVICE_TYPE === 'web' &&
    !process.env.RENDER_SERVICE_PAID;
  
  // Only apply constraints in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  return isProduction && (memoryOptimized || hasSmallHeapSize || isRenderFreeTier);
};

/**
 * Returns environment-specific configuration for memory usage
 */
export const getMemoryConfig = () => {
  const isConstrained = isMemoryConstrainedEnvironment();
  
  return {
    isConstrained,
    // Use shorter intervals for DB connections in constrained environments
    mongoosePoolSize: isConstrained ? 3 : 10,
    // Reduce logging in constrained environments
    logLevel: isConstrained ? 'error' : 'info',
    // Increase memory monitoring interval in constrained environments (ms)
    memoryMonitoringInterval: isConstrained ? 5 * 60 * 1000 : 60 * 1000,
    // Disable certain features in constrained environments
    disableBackups: isConstrained,
    disableScheduledTasks: isConstrained,
    // Heap usage thresholds for warnings and critical alerts
    memoryWarningThreshold: 85, // percentage
    memoryCriticalThreshold: 90, // percentage
  };
}; 