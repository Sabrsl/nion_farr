import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that tracks memory usage during requests
 * Helps identify potential memory leaks and high memory consumption routes
 */
@Injectable()
export class MemoryTrackerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('MemoryTracker');
  private readonly memoryThreshold = 50 * 1024 * 1024; // 50MB
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly isMemoryOptimized = process.env.MEMORY_OPTIMIZED === 'true';
  private readonly trackInterval = 1000 * 60 * 5; // Log every 5 minutes
  private lastLogTime = Date.now();

  use(req: Request, res: Response, next: NextFunction) {
    // Skip if we're not in memory optimized mode
    if (!this.isMemoryOptimized) {
      return next();
    }

    // Get memory usage before processing request
    const before = process.memoryUsage();

    // Track when the request is done
    res.on('finish', () => {
      // Get memory usage after processing request
      const after = process.memoryUsage();
      
      // Calculate memory increase
      const heapIncrease = after.heapUsed - before.heapUsed;
      
      // Check if memory increase is beyond threshold
      const isHighMemoryUsage = heapIncrease > this.memoryThreshold;
      
      // Log if it's a high memory request or if it's time for periodic logging
      const shouldLog = isHighMemoryUsage || (Date.now() - this.lastLogTime > this.trackInterval);
      
      if (shouldLog) {
        const formatMemoryUsage = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100 + ' MB';
        
        this.logger.warn(`Memory usage for ${req.method} ${req.url}:`);
        this.logger.warn(`Heap increase: ${formatMemoryUsage(heapIncrease)}`);
        this.logger.warn(`Current heap: ${formatMemoryUsage(after.heapUsed)}`);
        
        this.lastLogTime = Date.now();
        
        // Force garbage collection if possible when heap is high in production
        if (isHighMemoryUsage && this.isProduction && global.gc) {
          this.logger.warn('Forcing garbage collection');
          global.gc();
        }
      }
    });

    next();
  }
} 