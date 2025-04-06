import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { rateLimit } from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Variables d'environnement
  const port = configService.get<number>('PORT') || 3001;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  
  // Middlewares de sécurité
  app.use(helmet());
  
  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
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
  
  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Nionfar API')
    .setDescription('API de la plateforme de services freelance Nionfar')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  // Démarrage du serveur
  await app.listen(port);
  console.log(`Application started on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap(); 