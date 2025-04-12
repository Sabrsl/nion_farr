const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ValidationPipe } = require('@nestjs/common');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

// Cache l'application pour les requêtes futures
let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

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
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configuration Swagger si on n'est pas en production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NionFar API')
      .setDescription('API pour la plateforme NionFar')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  await app.init();
  
  cachedApp = app;
  return app;
}

async function handler(event, context) {
  // Désactive le comportement de keep-alive Lambda pour éviter les timeouts
  context.callbackWaitsForEmptyEventLoop = false;
  
  const app = await bootstrap();
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
}

// Endpoint de santé pour les vérifications Vercel
module.exports = async (req, res) => {
  // Vérification de santé simple
  if (req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV, vercel: true });
  }
  
  // Gérer toutes les autres requêtes via l'application NestJS
  const server = await bootstrap();
  const serverlessHandler = serverless(server);
  return serverlessHandler(req, res);
}; 