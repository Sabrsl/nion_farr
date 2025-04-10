/**
 * Environment configuration utilities
 * Provides functions to check environment and memory optimization settings
 */

/**
 * Checks if the application is running in a memory-constrained environment
 * This is determined by either:
 * 1. The MEMORY_OPTIMIZED env var being set to 'true'
 * 2. The NODE_OPTIONS containing a small heap size limit (128MB or 256MB)
 * 3. Running in production mode on Render's free tier or Railway
 */
export const isMemoryConstrainedEnvironment = (): boolean => {
  // Check for explicit memory optimization flag
  const memoryOptimized = process.env.MEMORY_OPTIMIZED === 'true';
  
  // Check for small heap size in NODE_OPTIONS
  const hasSmallHeapSize = process.env.NODE_OPTIONS?.includes('--max-old-space-size=128') || 
                           process.env.NODE_OPTIONS?.includes('--max-old-space-size=256');
  
  // Check for Render free tier
  const isRenderFreeTier = process.env.IS_RENDER === 'true' && 
    process.env.RENDER_SERVICE_TYPE === 'web' &&
    !process.env.RENDER_SERVICE_PAID;
    
  // Check for Railway
  const isRailwayDeployment = process.env.RAILWAY_DEPLOYMENT === 'true';
    
  // Check for user synchronization disable flag
  const disableUserSync = process.env.DISABLE_USER_SYNC === 'true';
  
  // Only apply constraints in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  return isProduction && (memoryOptimized || hasSmallHeapSize || isRenderFreeTier || isRailwayDeployment || disableUserSync);
};

/**
 * Returns environment-specific configuration for memory usage
 */
export const getMemoryConfig = () => {
  const isConstrained = isMemoryConstrainedEnvironment();
  const isRailway = process.env.RAILWAY_DEPLOYMENT === 'true';
  
  return {
    isConstrained,
    // Railway permet un peu plus de mémoire que Render
    mongoosePoolSize: isRailway ? 3 : (isConstrained ? 2 : 10),
    // Reduce logging in constrained environments
    logLevel: isConstrained ? 'error' : 'info',
    // Increase memory monitoring interval in constrained environments (ms)
    memoryMonitoringInterval: isConstrained ? 30 * 60 * 1000 : 60 * 1000, // 30 minutes in constrained mode
    // Disable certain features in constrained environments
    disableBackups: isConstrained && !isRailway, // Activer les backups sur Railway
    disableScheduledTasks: isConstrained && !isRailway, // Activer certaines tâches sur Railway
    // Should we synchronize user data in memory
    disableUserSync: process.env.DISABLE_USER_SYNC === 'true' || isConstrained,
    // Heap usage thresholds for warnings and critical alerts
    memoryWarningThreshold: isRailway ? 80 : 75, // percentage
    memoryCriticalThreshold: isRailway ? 90 : 85, // percentage
  };
}; 