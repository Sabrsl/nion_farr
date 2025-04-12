/**
 * Memory monitoring script for Node.js
 * 
 * This script helps monitor memory usage in the application.
 * Run with: node src/scripts/memory-monitor.js
 */

const logMemoryUsage = () => {
  const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  
  const memoryData = process.memoryUsage();
  
  const memoryUsage = {
    rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> Total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> Actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };
  
  console.log('======= MEMORY USAGE ========');
  console.log(memoryUsage);
  console.log('=============================');
};

// Log memory usage immediately
logMemoryUsage();

// Set interval to log memory usage every 30 seconds
const interval = setInterval(logMemoryUsage, 30000);

// Keep the script running for monitoring
console.log('Memory monitoring started. Press Ctrl+C to exit.');

// Handle process termination
process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('Memory monitoring stopped.');
  process.exit(0);
});

module.exports = { logMemoryUsage }; 