require('reflect-metadata');
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module.js");
const check_env_1 = require("./config/check-env.js");
const environment_1 = require("./config/environment.js");

// Fonction principale
async function bootstrap() {
  try {
    // Vérification des variables d'environnement
    (0, check_env_1.checkRequiredEnvVars)();
    
    // Détection si on est dans un environnement avec contraintes mémoire
    const isMemoryConstrained = (0, environment_1.isMemoryConstrainedEnvironment)();
    
    // Options de création de l'application
    const appOptions = {
      cors: true,
      logger: isMemoryConstrained ? ['error', 'warn'] : ['error', 'warn', 'log'],
    };
    
    // Création de l'application NestJS
    const app = await core_1.NestFactory.create(app_module_1.AppModule, appOptions);
    
    // Récupération du service de configuration
    const configService = app.get(config_1.ConfigService);
    
    // Configuration du préfixe global pour les routes API
    app.setGlobalPrefix('api');
    
    // Configuration des middlewares Express
    app.use(helmet());
    app.use(compression());
    app.use(express.json({ limit: '10mb' }));
    
    // Configuration des validateurs globaux
    app.useGlobalPipes(new common_1.ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // Récupération du port depuis les variables d'environnement
    const port = configService.get('PORT') || 3000;
    
    // Démarrage du serveur
    await app.listen(port);
    console.log(`🚀 Application démarrée sur: http://localhost:${port}/api`);
    
    // Log de l'environnement
    console.log(`🌍 Environnement: ${configService.get('NODE_ENV')}`);
    if (isMemoryConstrained) {
      console.log('🧠 Mode économie de mémoire activé');
    }
  } catch (error) {
    console.error('❌ Erreur au démarrage de l\'application:', error);
    process.exit(1);
  }
}

// Exécution de la fonction bootstrap
bootstrap(); 