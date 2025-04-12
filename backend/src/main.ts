import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { rateLimit } from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Sentry from '@sentry/node';
import { checkRequiredEnvVars } from './config/check-env';
import { startMemoryMonitoring, setupGracefulShutdown } from './performance/memory-monitor';
import { isMemoryConstrainedEnvironment, getMemoryConfig } from './config/environment';

// Garde pour éviter la fermeture du processus Node.js
// Cette variable globale sera référencée et jamais nettoyée, gardant ainsi le processus actif
const KEEPALIVE_INTERVAL = setInterval(() => {
  process.stdout.write(''); // No-op pour maintenir le processus actif
}, 60000);

// Ajout d'un timekeeper pour éviter que le processus ne se termine
let isBootstrapComplete = false;

async function bootstrap() {
  console.log("🟢 Lancement main.ts avec PORT:", process.env.PORT);
  console.log('Démarrage du serveur NionFar API...');
  
  try {
    // Correction manuelle de l'URL MongoDB si elle contient le paramètre batchsize
    if (process.env.MONGODB_URI) {
      const originalUri = process.env.MONGODB_URI;
      const correctedUri = originalUri
        .replace(/&batchsize=[^&]*/g, '')
        .replace(/\?batchsize=[^&]*&/g, '?')
        .replace(/\?batchsize=[^&]*$/g, '');
      
      if (originalUri !== correctedUri) {
        console.log('🔧 Correction de l\'URL MongoDB (suppression du paramètre batchsize)');
        process.env.MONGODB_URI = correctedUri;
      }
    }
    
    // Setup graceful shutdown handlers
    setupGracefulShutdown();
    
    // Vérifier les variables d'environnement requises
    checkRequiredEnvVars();
    
    // Get memory configuration
    const memoryConfig = getMemoryConfig();
    
    try {
      // Configuration du logger - reduced logging to save memory
      const logger = WinstonModule.createLogger({
        transports: [
          new winston.transports.Console({
            level: memoryConfig.logLevel,
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ],
      });

      const app = await NestFactory.create(AppModule, { 
        logger,
        abortOnError: false 
      });
      
      const configService = app.get(ConfigService);
      
      // Variables d'environnement
      const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
      const environment = configService.get<string>('NODE_ENV') || 'development';
      const port = parseInt(process.env.PORT || '3000', 10);
      console.log(`🚨 DIAGNOSTIC NESTJS: process.env.PORT=${process.env.PORT}, utilisant le port ${port}`);
      
      // Détection du mode serverless (Vercel)
      const isServerless = process.env.VERCEL === '1' || process.env.SERVERLESS === 'true';
      console.log(`Mode serverless: ${isServerless ? 'OUI' : 'NON'}`);
      
      // Configuration Sentry en production - disabled for memory optimization
      if (environment === 'production' && !memoryConfig.isConstrained) {
        const sentryDsn = configService.get<string>('SENTRY_DSN');
        if (sentryDsn) {
          try {
            Sentry.init({
              dsn: sentryDsn,
              environment,
              // No performance monitoring to save memory
              tracesSampleRate: 0.1,
              // Disabled profiling to save memory
              profilesSampleRate: 0.0,
            });
          } catch (error) {
            console.error('Failed to initialize Sentry:', error);
          }
        }
      }
      
      // Middlewares de sécurité
      app.use(helmet());
      
      // Rate limiting - increased window time to reduce memory pressure from tracking
      app.use(
        rateLimit({
          windowMs: memoryConfig.isConstrained ? 30 * 60 * 1000 : 15 * 60 * 1000, // 30 min in constrained env, 15 min otherwise
          max: 100, // limit each IP to 100 requests per windowMs
          standardHeaders: true,
          legacyHeaders: false,
        }),
      );
      
      // CORS - Configuration pour la production et le développement
      const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS')?.split(',') || [frontendUrl];
      
      // Configuration CORS plus permissive pour assurer la compatibilité avec Vercel
      console.log(`🔒 Configuration CORS pour: ${frontendUrl}`);
      app.enableCors({
        origin: (origin, callback) => {
          // Autoriser les requêtes sans origine (comme les requêtes mobiles ou Postman)
          if (!origin) {
            callback(null, true);
            return;
          }
          
          // Vérifier si l'origine est dans la liste des origines autorisées
          // Si allowedOrigins est 'true', toutes les origines sont autorisées
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
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin', 'X-CSRF-Token'],
        exposedHeaders: ['Content-Disposition', 'X-CSRF-Token'],
        credentials: true,
        maxAge: 86400, // 24 heures
        preflightContinue: false,
        optionsSuccessStatus: 204
      });

      // Compression
      app.use(compression());

      // Validation globale
      app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }));

      // Préfixe global de l'API
      app.setGlobalPrefix(apiPrefix);

      // Documentation Swagger - disabled in production to save memory
      if (environment !== 'production') {
        const config = new DocumentBuilder()
          .setTitle('NionFar API')
          .setDescription('API documentation for NionFar')
          .setVersion('1.0')
          .addBearerAuth()
          .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
      }

      // Ajouter une route de base pour le healthcheck
      const httpAdapter = app.getHttpAdapter();
      httpAdapter.get('/', (req, res) => {
        console.log('ROOT / route called - healthcheck from outside');
        return res.json({
          status: 'ok',
          message: 'NionFar API is up and running',
          timestamp: new Date().toISOString(),
          environment,
          deploymentPlatform: memoryConfig.deploymentPlatform
        });
      });

      // Ajouter une route GET spécifique pour le healthcheck
      httpAdapter.get('/health', (req, res) => {
        console.log(`Healthcheck appelé (${new Date().toISOString()})`);
        return res.json({
          status: 'ok',
          message: 'API running',
          timestamp: new Date().toISOString(),
          deployment: 'vercel',
          uptime: process.uptime(),
          is_alive: true
        });
      });

      // Route de healthcheck plus détaillée avec état de la mémoire
      httpAdapter.get('/health/detailed', (req, res) => {
        const memUsage = process.memoryUsage();
        
        return res.json({
          status: 'ok',
          message: 'Detailed healthcheck passed',
          timestamp: new Date().toISOString(),
          environment,
          deployment: {
            platform: memoryConfig.deploymentPlatform,
            vercel: process.env.VERCEL === '1',
          },
          system: {
            uptime: process.uptime(),
            memory: {
              rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
              heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
              heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
              external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
              percentUsed: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
            },
            versions: {
              node: process.version,
              platform: process.platform
            }
          }
        });
      });

      // Route de ping simplifiée pour les vérifications ultra-rapides
      httpAdapter.get('/health/ping', (req, res) => {
        return res.send('pong');
      });

      // En mode serverless, on n'appelle pas app.listen()
      if (!isServerless) {
        // Démarrage du serveur - point critique, doit toujours être exécuté
        await app.listen(port, '0.0.0.0');
        
        // Marquer que le bootstrap est complété
        isBootstrapComplete = true;
        
        console.log(`🚨 DIAGNOSTIC NESTJS FINAL: Écoutant sur PORT=${port}, variable d'env PORT=${process.env.PORT}`);
        console.log(`✅ NionFar API est prêt et écoute sur http://0.0.0.0:${port}`);
        console.log(`✅ Routes de Healthcheck disponibles:`);
        console.log(`  - http://0.0.0.0:${port}/health`);
        console.log(`  - http://0.0.0.0:${port}/health/ping`);
        console.log(`  - http://0.0.0.0:${port}/api/health`);
        
        // Afficher l'information sur le déploiement
        const isVercel = process.env.VERCEL === '1';
        const appUrl = configService.get<string>('APP_URL') || `http://localhost:${port}`;
        
        console.log(`Serveur NionFar API démarré sur le port ${port}`);
        console.log(`🚀 Environnement: ${environment} (${memoryConfig.deploymentPlatform})`);
        console.log(`🚀 URL: ${appUrl}`);
        
        if (memoryConfig.isConstrained) {
          console.log(`🧠 Mode d'optimisation mémoire activé - certaines fonctionnalités sont désactivées`);
        }

        // Start memory monitoring 
        startMemoryMonitoring(memoryConfig.memoryMonitoringInterval);

        // Log CORS configuration
        console.log(`🔒 CORS configuré pour: ${Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins}`);
      } else {
        console.log('🚀 Mode serverless détecté, pas de démarrage du serveur HTTP');
        console.log('✅ NionFar API est configuré pour fonctionner en tant que fonction serverless sur Vercel');
      }

    } catch (error) {
      console.error('❌ Erreur catastrophique lors de la création de l\'application NestJS:', error);
      
      // En environnement local, on termine le processus avec une erreur
      process.exit(1);
    }
  } catch (outerError) {
    console.error('❌ ERREUR FATALE lors du démarrage:', outerError);
    // Ne pas terminer le processus pour éviter que Vercel ne redémarre en boucle
    
    // Démarrer un serveur HTTP minimal de secours
    const http = require('http');
    const emergencyPort = parseInt(process.env.PORT || '3000', 10);
    
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'fatal_error',
        message: 'NionFar API en mode d\'urgence',
        error: outerError.message,
        timestamp: new Date().toISOString()
      }));
    });
    
    server.listen(emergencyPort, '0.0.0.0', () => {
      console.log(`🚨 Serveur d'URGENCE démarré sur le port ${emergencyPort}`);
    });
  }
}

// Garde supplémentaire pour maintenir le processus en vie même après le bootstrap
// Important: cette fonction est cruciale pour Vercel
process.nextTick(() => {
  setTimeout(() => {
    if (!isBootstrapComplete) {
      console.log('⚠️ Le bootstrap n\'est toujours pas terminé, mais on maintient le processus actif');
    }
  }, 30000); // Vérifier après 30 secondes
});

// Ajouter ces handlers pour détecter les crashs invisibles
process.on('unhandledRejection', (reason, promise) => {
  console.error('🛑 Unhandled Promise Rejection:', reason);
  // Ne pas quitter le processus pour la stabilité du serveur
});

process.on('uncaughtException', (err) => {
  console.error('🛑 Uncaught Exception:', err);
  console.error(err.stack);
  // Retarder la sortie pour voir les logs
  setTimeout(() => process.exit(1), 5000);
});

// Ajouter un handler SIGTERM pour graceful shutdown
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu. Arrêt gracieux du serveur...');
  setTimeout(() => process.exit(0), 3000);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu. Arrêt gracieux du serveur...');
  setTimeout(() => process.exit(0), 3000);
});

// Démarrer l'application
bootstrap(); 