/**
 * Point d'entrée backend pour Railway
 * Version professionnelle avec initialisation correcte de reflect-metadata
 */

// IMPORTANT: Charger reflect-metadata avant toute autre chose
require('reflect-metadata');

const fs = require('fs');
const path = require('path');

// Configuration de base
const PORT = process.env.PORT || 8080;
const LOG_DIR = path.join(__dirname, 'logs');
const MAIN_LOG = path.join(LOG_DIR, 'startup.log');
const DIST_MAIN = path.join(__dirname, 'dist', 'main.js');

// Assurer que le dossier de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Fonction de log avec horodatage
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(MAIN_LOG, logMessage);
}

// Vérifier si le fichier principal existe
if (!fs.existsSync(DIST_MAIN)) {
  log(`❌ Erreur: ${DIST_MAIN} est introuvable!`);
  process.exit(1);
}

// Lancer l'application principale
log('🚀 Démarrage de l\'application NestJS principale...');

try {
  // Initialiser les options de Node.js pour optimiser les performances
  process.env.NODE_OPTIONS = '--max-old-space-size=512 --trace-warnings';
  log('✅ Options Node.js configurées pour les performances optimales');
  
  // Import du module principal de l'application
  require(DIST_MAIN);
  log('✅ Module principal chargé avec succès');
} catch (error) {
  log(`❌ Erreur lors du démarrage de l'application principale: ${error.message}`);
  log(error.stack);
  process.exit(1);
}

// Gérer les signaux de terminaison
process.on('SIGTERM', () => {
  log('Signal SIGTERM reçu, arrêt propre...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Signal SIGINT reçu, arrêt propre...');
  process.exit(0);
});

// Capture des erreurs non gérées pour éviter les crashs
process.on('uncaughtException', (error) => {
  log(`❌ Exception non gérée: ${error.message}`);
  log(error.stack);
});

process.on('unhandledRejection', (reason) => {
  log(`❌ Promesse rejetée non gérée: ${reason}`);
}); 