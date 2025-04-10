/**
 * Serveur de secours simple pour Railway
 * À utiliser quand le build de NestJS échoue
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Démarrage du serveur de secours NionFar...');
console.log(`📊 Variables d'environnement: PORT=${PORT}`);

// Middleware pour les logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configuration CORS simple
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Serveur de secours NionFar actif',
    timestamp: new Date().toISOString(),
    fallback: true
  });
});

app.get('/health/ping', (req, res) => {
  res.status(200).send('pong');
});

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Serveur de secours NionFar',
    timestamp: new Date().toISOString()
  });
});

// API route de base
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'API en mode maintenance',
    maintenance: true,
    fallback: true
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur de secours démarré sur port ${PORT}`);
  console.log(`✅ Healthcheck disponible sur http://0.0.0.0:${PORT}/health`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Gestion de l'arrêt
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu. Arrêt du serveur...');
  setTimeout(() => process.exit(0), 1000);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu. Arrêt du serveur...');
  setTimeout(() => process.exit(0), 1000);
}); 