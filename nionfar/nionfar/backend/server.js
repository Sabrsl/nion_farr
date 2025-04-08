'use strict';

// Serveur minimal pour Render en cas d'échec du démarrage de NestJS
const http = require('http');

console.log('Starting minimal server for Render');
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

const port = process.env.PORT || 3001;
const server = http.createServer((req, res) => {
  console.log('Received request:', req.method, req.url);
  
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Minimal server running' }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Nionfar API - Le serveur est en cours de démarrage. Veuillez réessayer dans quelques instants.');
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
}); 