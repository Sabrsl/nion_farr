/**
 * Serveur de secours simple pour Railway
 * À utiliser quand le build de NestJS échoue
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const cors = require('cors');

// Récupérer les variables d'environnement
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
  : [FRONTEND_URL];

console.log('🚀 Démarrage du serveur de secours NionFar...');
console.log(`📊 Variables d'environnement:`);
console.log(`- PORT: ${PORT}`);
console.log(`- FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`- CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}`);

// Parser JSON
app.use(express.json());

// Middleware pour les logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuration CORS avancée
app.use(cors({
  origin: CORS_ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Routes de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Serveur de secours NionFar actif',
    timestamp: new Date().toISOString(),
    fallback: true
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API en mode de secours',
    timestamp: new Date().toISOString()
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

// Routes API avancées
// Route pour les tokens CSRF
app.get('/api/security/csrf-tokens', (req, res) => {
  res.json({
    token: 'fallback-csrf-token-' + Math.random().toString(36).substring(2, 15),
    timestamp: new Date().toISOString()
  });
});

// Routes d'authentification
app.post('/api/auth/login', (req, res) => {
  // Simuler un délai d'authentification
  setTimeout(() => {
    res.json({
      status: 'ok',
      message: 'Authentification en mode de secours - fonctionnalités limitées',
      user: { id: 1, username: 'demo', role: 'user' },
      token: 'fallback-token-' + Math.random().toString(36).substring(2, 15)
    });
  }, 300);
});

app.post('/api/auth/register', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Enregistrement simulé en mode de secours',
    user: { id: 2, username: req.body.username || 'new-user', role: 'user' }
  });
});

// Route de statut
app.get('/api/status', (req, res) => {
  res.json({
    status: 'fallback',
    uptime: process.uptime(),
    message: 'Serveur en mode de secours',
    environment: process.env.NODE_ENV || 'production',
    railway: process.env.RAILWAY_DEPLOYMENT === 'true'
  });
});

// Capture toutes les autres routes API
app.all('/api/*', (req, res) => {
  res.status(200).json({
    status: 'fallback',
    message: 'Endpoint non implémenté en mode secours',
    path: req.path,
    method: req.method,
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