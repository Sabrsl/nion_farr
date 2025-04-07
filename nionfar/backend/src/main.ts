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
    const port = configService.get<number>('PORT') || 3001;
    const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
    const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
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
    
    // CORS
    app.enableCors({
      origin: [frontendUrl],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
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
            connectSrc: ["'self'", 'https://api.nionfar.sn'],
          },
        }),
      );
    }
    
    console.log(`Starting server on port ${port}...`);
    
    // Démarrage du serveur
    await app.listen(port);
    console.log(`Server is running on: http://localhost:${port}/${apiPrefix}`);
    
    if (environment !== 'production') {
      console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
    }
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap(); 