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
    
    // Afficher des détails plus précis sur chaque variable manquante
    missingVars.forEach(varName => {
      logger.error(`- ${varName}: non définie`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      logger.error('⚠️ Ces variables sont requises en production!');
      
      // Message pour Render
      if (process.env.IS_RENDER === 'true') {
        logger.error('Pour configurer ces variables sur Render:');
        logger.error('1. Allez dans le tableau de bord Render');
        logger.error('2. Sélectionnez votre service');
        logger.error('3. Allez dans l\'onglet "Environment"');
        logger.error('4. Ajoutez les variables manquantes dans la section "Environment Variables"');
      }
    }
  } else {
    logger.log('✅ Toutes les variables d\'environnement requises sont définies');
  }
  
  // Vérifications de la connexion MongoDB
  if (process.env.MONGODB_URI) {
    // Valider le format de l'URI MongoDB
    const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
    if (!mongoUriPattern.test(process.env.MONGODB_URI)) {
      logger.error('❌ Format invalide pour MONGODB_URI');
      logger.error(`Format attendu: mongodb://user:password@host:port/database ou mongodb+srv://user:password@host/database`);
    } else {
      logger.log('✅ Format de MONGODB_URI valide');
    }
  }
  
  // Vérification du frontend URL et CORS
  if (process.env.FRONTEND_URL) {
    logger.log(`✅ FRONTEND_URL configuré: ${process.env.FRONTEND_URL}`);
  } else {
    logger.warn('⚠️ FRONTEND_URL non défini, utilisera localhost:3000 par défaut');
  }
  
  if (process.env.CORS_ALLOWED_ORIGINS) {
    logger.log(`✅ CORS configuré pour: ${process.env.CORS_ALLOWED_ORIGINS}`);
  } else {
    logger.warn('⚠️ CORS_ALLOWED_ORIGINS non défini, utilisera FRONTEND_URL ou localhost par défaut');
  }
  
  // Vérifications supplémentaires pour les variables critiques
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('⚠️ JWT_SECRET est trop court pour la production (< 32 caractères)');
  }
  
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    logger.warn('⚠️ JWT_REFRESH_SECRET est trop court pour la production (< 32 caractères)');
  }
  
  // Information sur l'environnement
  if (process.env.NODE_ENV === 'production') {
    logger.log('🚀 Application démarrée en mode PRODUCTION');
    
    // Afficher la plateforme
    if (process.env.IS_RENDER === 'true') {
      logger.log('🖼️ Déployé sur Render');
    } else {
      logger.log('🌐 Déployé sur une autre plateforme');
    }
  } else {
    logger.log(`🔧 Application démarrée en mode ${process.env.NODE_ENV || 'development'}`);
  }
  
  return missingVars.length === 0;
} 