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
import { startMemoryMonitoring, setupGracefulShutdown } from './scripts/memory-management';
import { isMemoryConstrainedEnvironment, getMemoryConfig } from './config/environment';

async function bootstrap() {
  console.log('Démarrage du serveur NionFar API...');
  
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
      origin: ['https://nion-farr.vercel.app', 'http://localhost:3000', ...allowedOrigins],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 3600,
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

    // Démarrage du serveur
    await app.listen(port, '0.0.0.0');
    
    // Afficher l'information sur le déploiement
    const isRailway = process.env.RAILWAY_DEPLOYMENT === 'true';
    const appUrl = configService.get<string>('APP_URL') || `http://localhost:${port}`;
    
    console.log(`Serveur NionFar API démarré sur le port ${port}`);
    console.log(`🚀 Environnement: ${environment} (${memoryConfig.deploymentPlatform})`);
    console.log(`🔗 URL: ${appUrl}`);
    
    if (memoryConfig.isConstrained) {
      console.log(`🧠 Mode d'optimisation mémoire activé - certaines fonctionnalités sont désactivées`);
    }

    // Start memory monitoring 
    startMemoryMonitoring(memoryConfig.memoryMonitoringInterval);

    // Log CORS configuration
    console.log(`🔒 CORS configuré pour: ${Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins}`);

  } catch (error) {
    console.error('Error during bootstrap:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu. Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu. Arrêt du serveur...');
  process.exit(0);
});

bootstrap(); 