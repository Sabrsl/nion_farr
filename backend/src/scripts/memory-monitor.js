/**
 * Memory Monitoring Script
 * 
 * This script provides real-time monitoring of Node.js memory usage
 * Run with: node src/scripts/memory-monitor.js
 */

// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Calculate percentage
function calculatePercentage(used, total) {
  return Math.round((used / total) * 100);
}

// Print memory usage with colors
function printMemoryUsage() {
  const memUsage = process.memoryUsage();
  
  const heapUsed = memUsage.heapUsed;
  const heapTotal = memUsage.heapTotal;
  const rss = memUsage.rss;
  const external = memUsage.external;
  
  const heapPercentage = calculatePercentage(heapUsed, heapTotal);
  
  // Define color codes
  const reset = "\x1b[0m";
  const red = "\x1b[31m";
  const green = "\x1b[32m";
  const yellow = "\x1b[33m";
  
  // Determine color based on usage percentage
  let color = green;
  if (heapPercentage > 85) color = red;
  else if (heapPercentage > 70) color = yellow;
  
  console.clear();
  console.log('==== MEMORY USAGE MONITOR ====');
  console.log(`Time: ${new Date().toLocaleTimeString()}`);
  console.log(`Heap Used: ${color}${formatBytes(heapUsed)}${reset} / ${formatBytes(heapTotal)} (${heapPercentage}%)`);
  console.log(`RSS: ${formatBytes(rss)}`);
  console.log(`External: ${formatBytes(external)}`);
  console.log(`Available Heap: ${formatBytes(heapTotal - heapUsed)}`);
  console.log('=============================');
  console.log('Press Ctrl+C to exit');
}

// Start monitoring
console.log('Starting memory monitoring...');
// Initial output
printMemoryUsage();

// Setup interval for continuous monitoring
setInterval(printMemoryUsage, 1000);

// Handle graceful exit
process.on('SIGINT', () => {
  console.log('\nMemory monitoring stopped');
  process.exit(0);
}); 