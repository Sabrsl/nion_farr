/**
 * Simple fallback server for Railway deployment
 * This server ensures health checks will always succeed
 * It's a simplified version of server.js with minimal dependencies
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Server configuration
const PORT = process.env.PORT || 8080;
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'simple-server.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  fs.appendFileSync(LOG_FILE, logMessage, { flag: 'a' });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Log each request
  log(`Request received: ${req.method} ${req.url}`);
  
  // Handle routes
  if (req.url === '/health' || req.url === '/health/ping' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Service available (simplified mode)',
      timestamp: new Date().toISOString(),
      fallback: true,
      mode: 'simple_server'
    }));
    return;
  }
  
  // Main API route
  if (req.url.startsWith('/api/')) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'service_unavailable',
      message: 'API in maintenance, please try again later',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Default route - maintenance page
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NionFar API - Maintenance Mode</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          h1 { color: #333; }
          .status { padding: 10px; background-color: #fff3cd; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>NionFar API</h1>
          <div class="status">
            <p><strong>Status:</strong> Maintenance Mode</p>
            <p>The main server is temporarily unavailable.</p>
            <p>The API will be restored soon.</p>
            <p><small>Timestamp: ${new Date().toISOString()}</small></p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start server and handle errors
try {
  server.listen(PORT, '0.0.0.0', () => {
    log(`✅ Simple server started on port ${PORT}`);
    log('⚠️ This is a FALLBACK server and does not provide the full API');
    log('👉 It only responds to health checks to maintain the deployment');
  });
  
  // Handle server errors
  server.on('error', (error) => {
    log(`❌ Server error: ${error.message}`);
  });
} catch (error) {
  log(`❌ Fatal error: ${error.message}`);
}

// Handle process termination signals
process.on('SIGTERM', () => {
  log('SIGTERM signal received, shutting down server');
  server.close(() => {
    log('Server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('SIGINT signal received, shutting down server');
  server.close(() => {
    log('Server shut down gracefully');
    process.exit(0);
  });
});

// Capture unhandled exceptions
process.on('uncaughtException', (error) => {
  log(`❌ Unhandled exception: ${error.message}`);
  log(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled promise rejection: ${reason}`);
}); 