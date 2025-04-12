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