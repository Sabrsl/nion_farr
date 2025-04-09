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

async function bootstrap() {
  console.log('Starting server...');
  console.log('Current directory:', process.cwd());
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    API_PREFIX: process.env.API_PREFIX,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
  });

  try {
    // Configuration du logger
    const logger = WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });

    console.log('Initializing application...');

    const app = await NestFactory.create(AppModule, { 
      logger,
      abortOnError: false 
    });
    
    console.log('Application created, getting config service...');
    
    const configService = app.get(ConfigService);
    
    // Variables d'environnement
    const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
    const environment = configService.get<string>('NODE_ENV') || 'development';
    
    console.log(`Environment: ${environment}`);
    console.log(`MongoDB URI: ${configService.get<string>('MONGODB_URI')}`);
    
    // Configuration Sentry en production
    if (environment === 'production') {
      const sentryDsn = configService.get<string>('SENTRY_DSN');
      if (sentryDsn) {
        try {
          Sentry.init({
            dsn: sentryDsn,
            environment,
            // Performance monitoring de base
            tracesSampleRate: 1.0,
            // Désactivation du profiling
            profilesSampleRate: 0.0,
          });
          console.log('Sentry initialized for error tracking');
        } catch (error) {
          console.error('Failed to initialize Sentry:', error);
        }
      }
    }
    
    // Middlewares de sécurité
    app.use(helmet());
    
    // Rate limiting
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      }),
    );
    
    // CORS - Configuration pour la production et le développement
    const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const allowedOrigins = [frontendUrl];
    
    // Ajouter d'autres origines depuis les variables d'environnement si nécessaires
    const additionalOrigins = configService.get<string>('ADDITIONAL_CORS_ORIGINS');
    if (additionalOrigins) {
      allowedOrigins.push(...additionalOrigins.split(','));
    }
    
    if (environment === 'development') {
      // En développement, être plus permissif
      allowedOrigins.push('*');
      console.log('Mode développement: CORS configuré pour les origines:', allowedOrigins);
    } else {
      console.log('Mode production: CORS configuré pour les origines spécifiques:', allowedOrigins);
    }
    
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      credentials: true
    });
    
    // Préfixe global pour toutes les routes
    app.setGlobalPrefix(apiPrefix);
    
    // Validation des données
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    // Compression
    app.use(compression());
    
    // Configuration Swagger
    if (environment !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Nionfar API')
        .setDescription('API de la plateforme de services freelance Nionfar')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
    }
    
    // HSTS
    if (configService.get<string>('HSTS_ENABLED') === 'true') {
      app.use((req, res, next) => {
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains',
        );
        next();
      });
    }
    
    // Content Security Policy
    if (configService.get<string>('CSP_ENABLED') === 'true') {
      app.use(
        helmet.contentSecurityPolicy({
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://nionfar-backend.onrender.com', 'https://nionfar.vercel.app', 'https://*.vercel.app'],
          },
        }),
      );
    }
    
    // Démarrer l'application
    const port = process.env.PORT || configService.get<number>('PORT') || 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on: ${await app.getUrl()}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📚 Swagger docs: ${await app.getUrl()}/${configService.get('API_PREFIX')}/docs`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap(); 