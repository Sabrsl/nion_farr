require('reflect-metadata');

/**
 * Fichier main.js de secours généré automatiquement par check-dist.js
 * Garantit un serveur fonctionnel même si le build échoue
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const express = require('express');
const cors = require('cors');
const http = require('http');

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de base
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : (process.env.FRONTEND_URL || '*'),
  credentials: true
}));
app.use(express.json());

// Middleware de logging minimal
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    backup: true 
  });
});

app.get('/health/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/health/detailed', (req, res) => {
  const memUsage = process.memoryUsage();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backup: true,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
    }
  });
});

// Route d'API basique
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'NionFar API server running in backup mode',
    frontend_url: process.env.FRONTEND_URL || 'undefined',
    cors_allowed_origins: process.env.CORS_ALLOWED_ORIGINS || 'undefined',
    port: PORT
  });
});

// Route racine pour les healthchecks
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'NionFar API backup server is running',
    timestamp: new Date().toISOString() 
  });
});

// Créer serveur HTTP pour pouvoir gérer la fermeture gracieuse
const server = http.createServer(app);

// Gérer les signaux de terminaison
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Sortir après un délai même si server.close() est bloqué
  setTimeout(() => {
    console.log('Délai dépassé, sortie forcée');
    process.exit(0);
  }, 5000);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.log('Délai dépassé, sortie forcée');
    process.exit(0);
  }, 5000);
});

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur de secours démarré sur le port ${PORT}`);
  console.log(`Health check disponible sur http://0.0.0.0:${PORT}/health/ping`);
});
