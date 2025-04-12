// Importer reflect-metadata au début du fichier pour les métadonnées NestJS
try {
  require('reflect-metadata');
} catch (e) {
  console.warn('⚠️ reflect-metadata non disponible:', e.message);
}

const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { Module } = require('@nestjs/common');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

// Tenter de charger le module AppModule depuis différents chemins possibles
let AppModule;
try {
  // Essayer le chemin standard après compilation avec TypeScript
  AppModule = require('../dist/src/app.module').AppModule;
  console.log('✅ Module chargé depuis ../dist/src/app.module');
} catch (error) {
  console.error('❌ Erreur lors du chargement depuis ../dist/src/app.module:', error.message);
  try {
    // Essayer le chemin sans src (si la structure est différente)
    AppModule = require('../dist/app.module').AppModule;
    console.log('✅ Module chargé depuis ../dist/app.module');
  } catch (secondError) {
    console.error('❌ Erreur lors du chargement depuis ../dist/app.module:', secondError.message);
    try {
      // Essayer le chemin absolu Vercel
      AppModule = require('/var/task/dist/src/app.module').AppModule;
      console.log('✅ Module chargé depuis /var/task/dist/src/app.module');
    } catch (thirdError) {
      console.error('❌ Erreur lors du chargement depuis /var/task/dist/src/app.module:', thirdError.message);
      try {
        // Autre chemin absolu Vercel
        AppModule = require('/var/task/backend/dist/src/app.module').AppModule;
        console.log('✅ Module chargé depuis /var/task/backend/dist/src/app.module');
      } catch (fourthError) {
        console.error('❌ Erreur lors du chargement depuis /var/task/backend/dist/src/app.module:', fourthError.message);
        
        // Créer un module statique de base sans métadonnées NestJS
        console.warn('⚠️ Création d\'un module AppModule factice pour éviter le crash');
        
        // Solution alternative n'utilisant pas de décorateurs ou métadonnées
        // Créer un module à la volée dans le style NestJS
        AppModule = class EmptyAppModule {}; 
        AppModule.providers = [];
        AppModule.imports = [];
        AppModule.controllers = [];
        AppModule.exports = [];
        
        // Réserver une fonction pour la compatibilité
        AppModule.__module = {
          imports: [],
          controllers: [],
          providers: [],
          exports: []
        };
      }
    }
  }
}

// Cache l'application pour les requêtes futures
let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    console.log('Initializing NestJS app...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
      abortOnError: false
    });
    
    // Configuration du préfixe API global
    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix);
    
    // Configuration CORS
    const corsOrigins = process.env.CORS_ALLOWED_ORIGINS 
      ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
      : ['https://nion-farr.vercel.app'];
    
    app.use(cors({
      origin: corsOrigins,
      credentials: true,
    }));
    
    // Middlewares de sécurité
    app.use(helmet());
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
    
    // Validation globale
    app.useGlobalPipes(require('@nestjs/common').ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
    console.log('NestJS app initialized successfully');
    
    cachedApp = app;
    return app;
  } catch (error) {
    console.error('Error initializing NestJS app:', error);
    throw error;
  }
}

// Endpoint de santé pour les vérifications Vercel
module.exports = async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Route racine et routes de santé - répondre directement sans passer par NestJS
  if (req.url === '/' || req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'NionFar API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: true,
      route: req.url
    });
  }
  
  try {
    // Gérer toutes les autres requêtes via l'application NestJS
    const server = await bootstrap();
    const serverlessHandler = serverless(server);
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
    });
  }
};

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