import { Logger } from '@nestjs/common';

export function checkRequiredEnvVars() {
  const logger = new Logger('EnvironmentCheck');
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'PORT',
    'NODE_ENV'
  ];
  
  logger.log('Vérification des variables d\'environnement...');
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      logger.error('Ces variables sont requises en production!');
    }
  } else {
    logger.log('Toutes les variables d\'environnement requises sont définies');
  }
  
  // Vérifications supplémentaires pour les variables critiques
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET est trop court pour la production (< 32 caractères)');
  }
  
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    logger.warn('JWT_REFRESH_SECRET est trop court pour la production (< 32 caractères)');
  }
  
  if (process.env.NODE_ENV === 'production') {
    logger.log('Application démarrée en mode PRODUCTION');
  } else {
    logger.log(`Application démarrée en mode ${process.env.NODE_ENV || 'development'}`);
  }
} 