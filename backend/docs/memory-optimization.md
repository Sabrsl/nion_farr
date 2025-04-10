# Memory Optimization Guide

This document outlines the memory optimization strategies implemented in the NionFar backend application to support deployment on platforms with limited resources, such as Render's free tier.

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Implemented Solutions](#implemented-solutions)
3. [Memory Optimization Components](#memory-optimization-components)
4. [Configuration](#configuration)
5. [Monitoring and Debug Tools](#monitoring-and-debug-tools)
6. [Deployment Guidelines](#deployment-guidelines)
7. [Troubleshooting](#troubleshooting)

## Problem Statement

The application was experiencing Out of Memory (OOM) errors when deployed on Render's free tier, which has a limited memory allocation of 512MB with an effective Node.js heap size of 128MB. The primary issues included:

- Frequent heap memory exhaustion
- Node.js process restarts due to memory limits
- Reduced performance under memory pressure
- MongoDB synchronization consuming excessive memory

## Implemented Solutions

We've implemented a comprehensive memory optimization strategy with the following key features:

1. **Environment-aware Configuration**
   - Dynamic configuration based on deployment environment
   - Reduced memory footprint in constrained environments
   - Feature toggling based on available resources

2. **MongoDB Connection Optimization**
   - Reduced connection pool size
   - Disabled synchronization when in memory-constrained mode
   - Optimized query settings to reduce memory overhead

3. **Memory Monitoring and Management**
   - Real-time memory usage tracking
   - Proactive garbage collection
   - Graceful shutdown handlers to prevent crashes

4. **Dynamic Feature Control**
   - Selective disabling of memory-intensive features
   - Extended rate-limiting windows to reduce tracking overhead
   - Reduced logging verbosity in memory-constrained environments

## Memory Optimization Components

### 1. Environment Configuration (`config/environment.ts`)

This module determines if the application is running in a memory-constrained environment and provides environment-specific configurations:

```typescript
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
```

### 2. MongoDB Memory Options (`config/mongodb-memory-options.ts`)

Provides optimized configuration for MongoDB connections to reduce memory usage:

```typescript
export const getMongooseMemoryOptions = () => ({
  batchSize: 100,
  autoIndex: false,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  poolSize: 3,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Compression to reduce memory usage
  compressors: 'zlib',
  // Don't keep track of writes to save memory
  w: 0,
  wtimeoutMS: 0,
  j: false
});
```

### 3. Memory Management (`scripts/memory-management.ts`)

Implements memory monitoring and automatic garbage collection attempts:

```typescript
export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  heapPercent: number;
  rss: number;
  external: number;
}

export const logMemoryUsage = (): MemoryStats => {
  const memUsage = process.memoryUsage();
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
  const heapPercent = Math.round((heapUsed / heapTotal) * 100);
  const rss = Math.round(memUsage.rss / 1024 / 1024);
  const external = Math.round(memUsage.external / 1024 / 1024);
  
  return { heapUsed, heapTotal, heapPercent, rss, external };
};
```

### 4. Application Bootstrap (`main.ts`)

Configures the application based on memory constraints:

```typescript
// Get memory configuration
const memoryConfig = getMemoryConfig();

// Configuration du logger - reduced logging to save memory
const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: memoryConfig.logLevel,
      // ...
    }),
  ],
});

// Rate limiting - increased window time to reduce memory pressure
app.use(
  rateLimit({
    windowMs: memoryConfig.isConstrained ? 30 * 60 * 1000 : 15 * 60 * 1000,
    // ...
  }),
);
```

## Configuration

### Environment Variables

The following environment variables control memory optimization:

| Variable | Description | Default |
|----------|-------------|---------|
| `MEMORY_OPTIMIZED` | Explicitly enable memory optimization | `false` |
| `NODE_OPTIONS` | Node.js options (e.g., `--max-old-space-size=128`) | - |
| `IS_RENDER` | Flag indicating deployment on Render | `false` |

### NPM Scripts

The project includes specialized scripts for memory-constrained environments:

```json
"start:render": "cross-env NODE_OPTIONS=\"--max-old-space-size=128\" npm run build && cross-env NODE_OPTIONS=\"--max-old-space-size=128\" cross-env MEMORY_OPTIMIZED=true node dist/main.js",
"start:low-memory": "cross-env NODE_OPTIONS=\"--max-old-space-size=128\" cross-env MEMORY_OPTIMIZED=true node dist/main.js",
"monitor:memory": "node src/scripts/memory-monitor.js"
```

## Monitoring and Debug Tools

### Memory Monitor

Use the included memory monitoring tool to track memory usage in real-time:

```bash
npm run monitor:memory
```

### Memory Profiling

For more detailed analysis, you can use Node.js's built-in heap snapshots:

```javascript
const heapdump = require('heapdump');
heapdump.writeSnapshot('heap-' + Date.now() + '.heapsnapshot');
```

## Deployment Guidelines

1. **Render Deployment**
   - The `render.yaml` file includes optimized settings for Render's free tier:
   ```yaml
   startCommand: cd backend && NODE_OPTIONS="--max-old-space-size=128" node dist/main.js
   envVars:
     - key: MEMORY_OPTIMIZED
       value: true
     - key: IS_RENDER
       value: true
   ```

2. **Manual Deployment**
   - Use the provided NPM scripts for memory-constrained environments:
   ```bash
   npm run start:low-memory
   ```

## Troubleshooting

### Out of Memory Errors

If you still encounter OOM errors:

1. **Check Environmental Detection**
   - Ensure memory optimization is correctly activated by checking logs for: `🧠 Mode d'optimisation mémoire activé`

2. **Optimize Database Queries**
   - Review MongoDB queries to ensure they're not loading too many documents at once
   - Use pagination for large result sets
   - Add appropriate indexes to speed up queries

3. **Disable Memory-Intensive Features**
   - Consider disabling additional features in `getMemoryConfig()`
   - Reduce the frequency of scheduled tasks

4. **Increase Memory Resources**
   - If persistent issues occur, consider upgrading to a higher-tier plan

### Memory Leak Detection

To identify memory leaks:

1. Run the memory monitor for an extended period
2. Look for steadily increasing heap usage that doesn't decrease after garbage collection
3. Use heap snapshots at different time intervals to compare memory allocations 