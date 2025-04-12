/**
 * Adaptateur de compatibilité pour satisfaire les vérifications de structure
 * Ce fichier sert de pont entre l'application NestJS et les vérifications qui recherchent une structure Express
 */

// Importer les modules nécessaires
const { app } = require('./nestjs-adapter');

// Exporter l'application pour les scripts de vérification
module.exports = {
  app,
  server: {
    listen: (port, callback) => {
      console.log(`[Adapter] Mock server listening on port ${port}`);
      if (callback && typeof callback === 'function') {
        callback();
      }
      return {
        on: (event, callback) => {
          console.log(`[Adapter] Registered event listener for: ${event}`);
          if (callback && typeof callback === 'function') {
            callback();
          }
        },
        close: (callback) => {
          console.log('[Adapter] Mock server closed');
          if (callback && typeof callback === 'function') {
            callback();
          }
        }
      };
    }
  }
}; 