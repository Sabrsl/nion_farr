'use strict';

console.log('Starting minimal server for Render');
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

// Minimal HTTP server to ensure the app starts
const http = require('http');
const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    message: 'NionFar API is running (fallback server)',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'unknown'
  }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
}); 