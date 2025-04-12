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
  
  // Check for Render free tier - désactivé si IS_RENDER est false
  const isRenderFreeTier = process.env.IS_RENDER === 'true' && 
    process.env.RENDER_SERVICE_TYPE === 'web' &&
    !process.env.RENDER_SERVICE_PAID;
    
  // Check for Vercel
  const isVercelDeployment = process.env.VERCEL === '1';
  
  // Check if we're on Vercel Pro plan
  const isVercelPro = isVercelDeployment && process.env.VERCEL_PLAN === 'pro';
    
  // Check for user synchronization disable flag
  const disableUserSync = process.env.DISABLE_USER_SYNC === 'true';
  
  // Only apply constraints in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // If we're on Vercel Pro, we're less constrained
  if (isVercelPro) {
    return isProduction && (memoryOptimized || hasLimitedHeapSize || disableUserSync);
  }
  
  // Otherwise use standard constraints
  return isProduction && (memoryOptimized || hasLimitedHeapSize || isRenderFreeTier || isVercelDeployment || disableUserSync);
};

/**
 * Returns environment-specific configuration for memory usage
 */
export const getMemoryConfig = () => {
  const isConstrained = isMemoryConstrainedEnvironment();
  const isVercel = process.env.VERCEL === '1';
  const isVercelPro = isVercel && process.env.VERCEL_PLAN === 'pro';
  const isRender = process.env.IS_RENDER === 'true';
  
  // Get heap size from NODE_OPTIONS if available
  const nodeOptions = process.env.NODE_OPTIONS || '';
  const heapSizeMatch = nodeOptions.match(/--max-old-space-size=(\d+)/);
  const heapSizeLimit = heapSizeMatch ? parseInt(heapSizeMatch[1], 10) : 0;
  
  return {
    isConstrained,
    // Adjust pool size based on plan
    mongoosePoolSize: isConstrained ? (isVercelPro ? 5 : 2) : 10,
    // Use more detailed logging on Pro plans
    logLevel: isConstrained ? (isVercelPro ? 'warn' : 'error') : 'info',
    // Monitoring interval - more frequent on Pro plans
    memoryMonitoringInterval: isConstrained 
      ? (isVercelPro ? 10 * 60 * 1000 : 30 * 60 * 1000) // 10 min on Pro, 30 min on free
      : 60 * 1000, // 1 min in non-constrained mode
    // Only disable features on very constrained environments
    disableBackups: isConstrained && !isVercelPro,
    disableScheduledTasks: isConstrained && !isVercelPro,
    // User sync settings
    disableUserSync: process.env.DISABLE_USER_SYNC === 'true' || (isConstrained && !isVercelPro),
    // Memory thresholds - more conservative on Pro plans because we have more memory
    memoryWarningThreshold: isVercelPro ? 85 : 75, // percentage
    memoryCriticalThreshold: isVercelPro ? 90 : 85, // percentage
    // Server info
    deploymentPlatform: isVercel ? `Vercel${isVercelPro ? ' Pro' : ''}` : (isRender ? 'Render' : 'Other'),
    heapSizeMB: heapSizeLimit || 'unknown',
  };
}; 