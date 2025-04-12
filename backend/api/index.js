// Définir des variables d'environnement par défaut pour les validations NestJS
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vynalapp:uVmENC9K21dkMfma@clusternionfar.rjuvvf7.mongodb.net/nionfar?retryWrites=true&w=majority&appName=Clusternionfar';
process.env.DB_HOST = process.env.DB_HOST || 'clusternionfar.rjuvvf7.mongodb.net';
process.env.DB_PORT = process.env.DB_PORT || '27017';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'vynalapp';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'uVmENC9K21dkMfma';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'nionfar';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'tempkey123456789';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'temprefreshkey123456789';
process.env.APP_URL = process.env.APP_URL || 'https://nion-farr-backend.vercel.app';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://nion-farr.vercel.app';
process.env.MAIL_HOST = process.env.MAIL_HOST || 'smtp.example.com';
process.env.MAIL_USER = process.env.MAIL_USER || 'test@example.com';
process.env.MAIL_PASSWORD = process.env.MAIL_PASSWORD || 'temppassword';
process.env.MAIL_FROM = process.env.MAIL_FROM || 'noreply@nionfar.com';
process.env.WAVE_API_KEY = process.env.WAVE_API_KEY || 'tempkey';
process.env.WAVE_API_SECRET = process.env.WAVE_API_SECRET || 'tempsecret';
process.env.WAVE_API_URL = process.env.WAVE_API_URL || 'https://api.wave.com';
process.env.ORANGE_MONEY_API_KEY = process.env.ORANGE_MONEY_API_KEY || 'tempkey';
process.env.ORANGE_MONEY_API_SECRET = process.env.ORANGE_MONEY_API_SECRET || 'tempsecret';
process.env.ORANGE_MONEY_API_URL = process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com';
process.env.FREE_MONEY_API_KEY = process.env.FREE_MONEY_API_KEY || 'tempkey';
process.env.FREE_MONEY_API_SECRET = process.env.FREE_MONEY_API_SECRET || 'tempsecret';
process.env.FREE_MONEY_API_URL = process.env.FREE_MONEY_API_URL || 'https://api.free.com';

// Handler simple pour Vercel sans dépendance à NestJS
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const serverless = require('serverless-http');

// Création d'une application Express simple
const app = express();

// Middlewares essentiels
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
const corsOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
  : ['https://nion-farr.vercel.app', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// Routes de base pour la santé et les tests
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NionFar API is running (Express standalone)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: true
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Health check passed',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API health check passed',
    timestamp: new Date().toISOString()
  });
});

// Autres routes API
app.get('/api/services', (req, res) => {
  // Réponse simulée pour les services
  res.status(200).json({
    status: 'success',
    data: [
      {
        id: 1,
        title: 'Développement Web',
        description: 'Création de sites et applications web modernes',
        price: 5000
      },
      {
        id: 2,
        title: 'Design Graphique',
        description: 'Création de logos et identités visuelles',
        price: 2500
      }
    ]
  });
});

// Route pour tester les connexions
app.get('/api/test-connection', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Connexion établie avec succès',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    ip: req.ip
  });
});

// Route pour afficher l'environnement
app.get('/api/environment', (req, res) => {
  // Filtrer les variables d'environnement sensibles
  const env = {};
  Object.keys(process.env)
    .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD'))
    .forEach(key => {
      env[key] = process.env[key];
    });

  res.status(200).json({
    status: 'success',
    environment: process.env.NODE_ENV || 'development',
    variables: env,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// Gestionnaire pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route non trouvée: ${req.method} ${req.url}`
  });
});

// Pour le développement local
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
  });
}

// Exporter le handler pour Vercel Serverless
module.exports = serverless(app); 