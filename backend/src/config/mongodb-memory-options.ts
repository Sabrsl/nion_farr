/**
 * MongoDB connection options optimized for low memory environments (Render Free tier)
 */

// Memory-optimized options for MongoDB connections
export const getMongooseMemoryOptions = () => ({
  // Disable automatic indexing which requires memory
  autoIndex: false,
  
  // Timeout settings to prevent hanging connections
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  
  // Buffer commands ensures stability but uses less memory
  bufferCommands: false,
  
  // Minimum amount of MongoDB connections
  minPoolSize: 1,
  maxPoolSize: 5,
  
  // Compression to reduce network traffic and memory usage
  compressors: 'zlib',
  
  // Not keeping track of writes can save memory
  writeConcern: {
    w: 1,
    j: false
  },
  
  // Retry connection but with reasonable limit
  retryAttempts: 3,
  retryDelay: 5000,
});

// Memory-optimized options for TypeORM MongoDB
export const getTypeOrmMemoryOptions = () => ({
  // Disable synchronization to prevent extensive memory operations
  synchronize: false,
  
  // Don't log queries to save memory
  logging: false,
  
  // Optimize connection pool
  extra: {
    // Limited pool size
    maxPoolSize: 5,
    minPoolSize: 1,
    
    // Timeout settings
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    
    // Compression
    compressors: 'zlib',
    
    // Write concern
    writeConcern: {
      w: 1,
      j: false
    }
  },
  
  // Retry options
  retryAttempts: 3,
  retryDelay: 5000,
}); 