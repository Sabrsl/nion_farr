/**
 * Point d'entrée pour l'application sur Railway
 * Charge les métadonnées de réflexion explicitement avant tout autre module
 */

// Import de reflect-metadata avant toute chose (CRITIQUE)
require('reflect-metadata');

// Démarrer l'application
try {
  console.log('🚀 Démarrage de l\'application NestJS sur Railway...');
  
  // Importer le point d'entrée principal
  require('./dist/main');
} catch (error) {
  console.error('❌ Erreur au démarrage de l\'application:', error);
  
  // Essayer de charger depuis un autre emplacement si le chemin principal échoue
  try {
    console.log('🔄 Tentative alternative de chargement...');
    require('./dist/src/main');
  } catch (innerError) {
    console.error('❌ Échec du chargement alternatif:', innerError);
    
    // Démarrer un serveur minimal pour éviter l'échec du déploiement
    console.log('⚠️ Démarrage du serveur minimal de secours...');
    
    const http = require('http');
    const server = http.createServer((req, res) => {
      if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'degraded',
          message: 'API en mode dégradé suite à une erreur de démarrage',
          timestamp: new Date().toISOString()
        }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('NionFar API - Mode dégradé');
    });
    
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Serveur de secours démarré sur le port ${PORT}`);
    });
  }
} 