const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

// Essayer différents chemins d'importation pour s'adapter à la structure du dossier dist
let AppModule;
try {
  // Essayer le chemin relatif que nous avons fixé précédemment
  AppModule = require('../dist/src/app.module').AppModule;
  console.log('✅ Module chargé depuis ../dist/src/app.module');
} catch (error) {
  try {
    // Essayer le chemin original
    AppModule = require('../dist/app.module').AppModule;
    console.log('✅ Module chargé depuis ../dist/app.module');
  } catch (secondError) {
    try {
      // Essayer avec le chemin absolu
      AppModule = require('/var/task/backend/dist/src/app.module').AppModule;
      console.log('✅ Module chargé depuis /var/task/backend/dist/src/app.module');
    } catch (thirdError) {
      try {
        // Dernier essai avec un autre chemin absolu
        AppModule = require('/var/task/backend/dist/app.module').AppModule;
        console.log('✅ Module chargé depuis /var/task/backend/dist/app.module');
      } catch (finalError) {
        console.error('❌ Impossible de trouver le module AppModule:', finalError);
        throw new Error(`Impossible de trouver le module AppModule. Erreur: ${finalError.message}`);
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
    const app = await NestFactory.create(AppModule);
    
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