const { NestFactory } = require('@nestjs/core');
const serverless = require('serverless-http');
const { ValidationPipe } = require('@nestjs/common');
const helmet = require('helmet');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');

// Importer le module principal de l'application
const { AppModule } = require('../dist/src/app.module');

// Cache de l'instance du serveur pour les cold starts
let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    
    // Middlewares de sécurité
    app.use(helmet());
    
    // Compression
    app.use(compression());
    
    // Rate limiting - configuration légère pour Vercel
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limite de 100 requêtes par fenêtre
        standardHeaders: true,
        legacyHeaders: false,
      }),
    );
    
    // Configuration CORS pour Vercel
    app.enableCors({
      origin: (origin, callback) => {
        // Autoriser les requêtes sans origine (comme les requêtes mobiles)
        if (!origin) {
          callback(null, true);
          return;
        }
        
        // Liste des origines autorisées
        const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || 
                               ['https://nion-farr.vercel.app', 'https://nion-farr-backend.vercel.app', 'http://localhost:3000'];
        
        if (allowedOrigins.includes(origin) || 
            allowedOrigins.includes('*') || 
            origin.includes('vercel.app') || 
            origin.includes('localhost')) {
          callback(null, true);
        } else {
          console.warn(`🚫 Origine bloquée par CORS: ${origin}`);
          callback(null, true); // Temporairement autorisé pour déboguer
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      credentials: true,
    });
    
    // Validation globale
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));
    
    // Préfixe global de l'API - NON NÉCESSAIRE pour Vercel car le préfixe est défini dans vercel.json
    // app.setGlobalPrefix('api');
    
    await app.init();
    
    // Récupérer l'instance Express sous-jacente
    const expressApp = app.getHttpAdapter().getInstance();
    
    // Transformer l'application Express en fonction serverless
    cachedServer = serverless(expressApp);
  }
  
  return cachedServer;
}

// Point d'entrée pour Vercel serverless
module.exports = async (req, res) => {
  const server = await bootstrap();
  return server(req, res);
}; 