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
import { Request, Response } from 'express';

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
    const port = process.env.PORT || 1000;
    
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
    const allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS')?.split(',') || [frontendUrl];
    
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token', 'X-Session-ID'],
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

    // Documentation Swagger
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
    console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`Environment: ${environment}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);

  } catch (error) {
    console.error('Error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap(); 