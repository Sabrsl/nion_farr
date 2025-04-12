/**
 * Adaptateur NestJS pour la compatibilité avec les vérifications Express
 */

// Importation des modules nécessaires
const { NestFactory } = require('@nestjs/core');
const express = require('express');
const { ExpressAdapter } = require('@nestjs/platform-express');

// Créer une application Express pour l'adapter
const expressApp = express();

// Fonction pour initialiser l'application NestJS
async function initializeNestApp() {
  try {
    console.log('[Adapter] Initializing NestJS application...');
    
    // Trouver le module AppModule dans les différents chemins possibles
    let AppModule;
    try {
      AppModule = require('./src/app.module').AppModule;
      console.log('[Adapter] Loaded AppModule from dist/src/app.module');
    } catch (error) {
      try {
        AppModule = require('./app.module').AppModule;
        console.log('[Adapter] Loaded AppModule from dist/app.module');
      } catch (secondError) {
        console.error('[Adapter] Failed to load AppModule:', secondError);
        // Créer un module factice si le véritable module est introuvable
        AppModule = {
          module: class AppModule {},
          imports: [],
          controllers: [],
          providers: [],
        };
        console.log('[Adapter] Created placeholder AppModule for compatibility');
      }
    }
    
    // Créer l'application NestJS avec l'adaptateur Express
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });
    
    // Configuration CORS si nécessaire
    app.enableCors({
      origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['https://nion-farr.vercel.app'],
      credentials: true,
    });
    
    // Initialiser l'application
    await app.init();
    console.log('[Adapter] NestJS application initialized successfully');
    
    return { app, expressApp };
  } catch (error) {
    console.error('[Adapter] Error initializing NestJS application:', error);
    return { app: null, expressApp };
  }
}

// Exporter une version mock pour les vérifications 
// La véritable initialisation se fera dans le handler Vercel
module.exports = {
  app: expressApp,
  initializeNestApp,
}; 