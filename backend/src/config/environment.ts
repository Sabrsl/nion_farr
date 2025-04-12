/**
 * Environment configuration utilities
 * Provides functions to check environment and memory optimization settings
 */

/**
 * Checks if the application is running in a memory-constrained environment
 * This is determined by either:
 * 1. The MEMORY_OPTIMIZED env var being set to 'true'
 * 2. The NODE_OPTIONS containing a heap size limit (1GB or less)
 * 3. Running in production mode on specific platforms
 */
export const isMemoryConstrainedEnvironment = (): boolean => {
  // Check for explicit memory optimization flag
  const memoryOptimized = process.env.MEMORY_OPTIMIZED === 'true';
  
  // Check for heap size limits in NODE_OPTIONS
  const nodeOptions = process.env.NODE_OPTIONS || '';
  const heapSizeMatch = nodeOptions.match(/--max-old-space-size=(\d+)/);
  const heapSizeLimit = heapSizeMatch ? parseInt(heapSizeMatch[1], 10) : 0;
  const hasLimitedHeapSize = heapSizeLimit > 0 && heapSizeLimit <= 1024; // 1GB or less
  
  // Check for Render free tier
  const isRenderFreeTier = process.env.IS_RENDER === 'true' && 
    process.env.RENDER_SERVICE_TYPE === 'web' &&
    !process.env.RENDER_SERVICE_PAID;
    
  // Check for user synchronization disable flag
  const disableUserSync = process.env.DISABLE_USER_SYNC === 'true';
  
  // Only apply constraints in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use standard constraints
  return isProduction && (memoryOptimized || hasLimitedHeapSize || isRenderFreeTier || disableUserSync);
};

/**
 * Returns environment-specific configuration for memory usage
 */
export const getMemoryConfig = () => {
  const isConstrained = isMemoryConstrainedEnvironment();
  const isRender = process.env.IS_RENDER === 'true';
  
  // Get heap size from NODE_OPTIONS if available
  const nodeOptions = process.env.NODE_OPTIONS || '';
  const heapSizeMatch = nodeOptions.match(/--max-old-space-size=(\d+)/);
  const heapSizeLimit = heapSizeMatch ? parseInt(heapSizeMatch[1], 10) : 0;
  
  return {
    isConstrained,
    // Adjust pool size based on environment
    mongoosePoolSize: isConstrained ? 2 : 10,
    // Use more detailed logging in non-constrained environments
    logLevel: isConstrained ? 'error' : 'info',
    // Monitoring interval
    memoryMonitoringInterval: isConstrained 
      ? 30 * 60 * 1000  // 30 min in constrained mode
      : 60 * 1000,      // 1 min in non-constrained mode
    // Only disable features on very constrained environments
    disableBackups: isConstrained,
    disableScheduledTasks: isConstrained,
    // User sync settings
    disableUserSync: process.env.DISABLE_USER_SYNC === 'true' || isConstrained,
    // Memory thresholds
    memoryWarningThreshold: 75, // percentage
    memoryCriticalThreshold: 85, // percentage
    // Server info
    deploymentPlatform: isRender ? 'Render' : 'Other',
    heapSizeMB: heapSizeLimit || 'unknown',
  };
}; 