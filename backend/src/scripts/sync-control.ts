/**
 * Synchronization control for memory-constrained environments
 * 
 * This module provides utilities to detect and prevent excessive data
 * synchronization between MongoDB and application memory, which can
 * lead to high memory usage and app crashes.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getMemoryConfig } from '../config/environment';

@Injectable()
export class SyncControlService implements OnModuleInit {
  private readonly logger = new Logger(SyncControlService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Check if user synchronization is disabled
   */
  get isSyncDisabled(): boolean {
    return getMemoryConfig().disableUserSync;
  }

  /**
   * Initialize when the module starts
   */
  onModuleInit() {
    const memoryConfig = getMemoryConfig();
    
    // Log synchronization status
    if (memoryConfig.disableUserSync) {
      this.logger.log('🔒 User data synchronization is DISABLED to conserve memory');
    } else {
      this.logger.log('🔄 User data synchronization is enabled');
    }
    
    // Warning for potential memory issues
    if (memoryConfig.isConstrained && !memoryConfig.disableUserSync) {
      this.logger.warn('⚠️ Running in memory-constrained environment with user synchronization enabled');
      this.logger.warn('   This may lead to high memory usage - consider setting DISABLE_USER_SYNC=true');
    }
  }

  /**
   * Check if an operation should be allowed based on synchronization settings
   * @param operationType The type of operation to check
   * @returns True if operation is allowed, false if it should be skipped
   */
  shouldPerformOperation(operationType: 'userSync' | 'bulkDataLoad' | 'tokenCache'): boolean {
    // If not in memory-constrained mode, allow all operations
    if (!getMemoryConfig().isConstrained) {
      return true;
    }
    
    // In memory-constrained mode, check specific operation types
    switch (operationType) {
      case 'userSync':
        return !getMemoryConfig().disableUserSync;
      case 'bulkDataLoad':
        return false; // Always prevent bulk data loading in constrained mode
      case 'tokenCache':
        return true; // Allow token caching even in constrained mode (needed for auth)
      default:
        return true;
    }
  }

  /**
   * Log a skipped operation for debugging
   */
  logSkippedOperation(operation: string): void {
    this.logger.debug(`🔒 Skipped operation to conserve memory: ${operation}`);
  }
} 