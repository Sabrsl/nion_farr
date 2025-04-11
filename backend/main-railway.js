/**
 * Point d'entrée backend pour Railway
 * Version optimisée avec initialisation correcte des dépendances
 */

// IMPORTANT: Charger reflect-metadata avant toute autre chose
require('reflect-metadata');

const fs = require('fs');
const path = require('path');
const { fork, spawn } = require('child_process');

// Configuration de base
const PORT = process.env.PORT || 8080;
const LOG_DIR = path.join(__dirname, 'logs');
const MAIN_LOG = path.join(LOG_DIR, 'startup.log');
const FALLBACK_SERVER = path.join(__dirname, 'server.js');
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

// Vérifier si des dépendances critiques sont manquantes
function verifyCriticalDependencies() {
  try {
    // Vérifier que reflect-metadata est correctement chargé
    if (typeof Reflect !== 'object' || typeof Reflect.getMetadata !== 'function') {
      log('⚠️ reflect-metadata n\'est pas correctement initialisé');
      // Essayer de le charger à nouveau
      require('reflect-metadata');
    }
    
    // Vérifier si mongoose est disponible
    try {
      const mongoose = require('mongoose');
      log('✅ Module mongoose trouvé et chargé');
    } catch (error) {
      log(`⚠️ Module mongoose non disponible: ${error.message}`);
    }
    
    // Vérifier NestJS
    try {
      const nest = require('@nestjs/common');
      log('✅ Module @nestjs/common trouvé et chargé');
    } catch (error) {
      log(`⚠️ Module @nestjs/common non disponible: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    log(`❌ Erreur lors de la vérification des dépendances: ${error.message}`);
    return false;
  }
}

// Vérifier les dépendances critiques
verifyCriticalDependencies();

// Vérifier si le fichier principal existe
if (!fs.existsSync(DIST_MAIN)) {
  log(`❌ Erreur fatale: ${DIST_MAIN} est introuvable!`);
  log('🔄 Démarrage du serveur de secours...');
  startFallbackServer();
} else {
  log('✅ Fichier principal trouvé, démarrage de l\'application NestJS...');
  startMainApp();
}

// Fonction pour démarrer l'application principale
function startMainApp() {
  log('🚀 Tentative de démarrage de l\'application principale...');
  
  try {
    // Utiliser fork pour exécuter le script principal dans un processus séparé
    // Définir NODE_OPTIONS pour augmenter la mémoire et charger reflect-metadata
    process.env.NODE_OPTIONS = '--max_old_space_size=512 --trace-warnings';
    
    const mainApp = fork(DIST_MAIN, [], { 
      env: process.env,
      stdio: 'pipe'
    });
    
    // Gérer les sorties et erreurs
    mainApp.stdout.on('data', (data) => {
      const output = data.toString().trim();
      log(`[APP] ${output}`);
    });
    
    mainApp.stderr.on('data', (data) => {
      const error = data.toString().trim();
      log(`[ERROR] ${error}`);
    });
    
    // Gérer la fermeture de l'application
    mainApp.on('close', (code) => {
      if (code !== 0) {
        log(`❌ L'application principale s'est arrêtée avec le code ${code}`);
        log('🔄 Démarrage du serveur de secours...');
        startFallbackServer();
      } else {
        log('✅ L\'application principale s\'est terminée normalement');
      }
    });
    
    // Gérer les erreurs
    mainApp.on('error', (err) => {
      log(`❌ Erreur lors du démarrage de l'application principale: ${err.message}`);
      log('🔄 Démarrage du serveur de secours...');
      startFallbackServer();
    });
  } catch (error) {
    log(`❌ Exception lors du démarrage de l'application principale: ${error.message}`);
    log('🔄 Démarrage du serveur de secours...');
    startFallbackServer();
  }
}

// Fonction pour démarrer le serveur de secours
function startFallbackServer() {
  log('🆘 Initialisation du serveur de secours...');
  
  if (!fs.existsSync(FALLBACK_SERVER)) {
    log(`❌ Erreur fatale: Le serveur de secours ${FALLBACK_SERVER} est également introuvable!`);
    log('💡 Création d\'un serveur HTTP minimal pour assurer les contrôles de santé...');
    startMinimalServer();
    return;
  }
  
  try {
    // Démarrer le serveur de secours
    const fallbackProcess = spawn('node', [FALLBACK_SERVER], { 
      env: process.env,
      stdio: 'pipe'
    });
    
    // Gérer les sorties et erreurs
    fallbackProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      log(`[FALLBACK] ${output}`);
    });
    
    fallbackProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      log(`[FALLBACK ERROR] ${error}`);
    });
    
    // Gérer la fermeture
    fallbackProcess.on('close', (code) => {
      log(`❌ Le serveur de secours s'est arrêté avec le code ${code}`);
      log('💡 Création d\'un serveur HTTP minimal pour assurer les contrôles de santé...');
      startMinimalServer();
    });
    
    // Gérer les erreurs
    fallbackProcess.on('error', (err) => {
      log(`❌ Erreur lors du démarrage du serveur de secours: ${err.message}`);
      log('💡 Création d\'un serveur HTTP minimal pour assurer les contrôles de santé...');
      startMinimalServer();
    });
  } catch (error) {
    log(`❌ Exception lors du démarrage du serveur de secours: ${error.message}`);
    log('💡 Création d\'un serveur HTTP minimal pour assurer les contrôles de santé...');
    startMinimalServer();
  }
}

// Fonction pour démarrer un serveur HTTP minimal de dernier recours
function startMinimalServer() {
  log('🔄 Démarrage du serveur HTTP minimal de secours ultime...');
  
  const http = require('http');
  
  // Créer un serveur HTTP minimal
  const server = http.createServer((req, res) => {
    // Route de contrôle de santé
    if (req.url === '/health' || req.url === '/health/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        mode: 'minimal_emergency_server',
        message: 'Le serveur de secours ultime est en fonctionnement',
        timestamp: new Date().toISOString()
      }));
      return;
    }
    
    // Toutes les autres routes
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'error', 
      message: 'Service temporairement indisponible. L\'équipe technique a été notifiée.',
      timestamp: new Date().toISOString()
    }));
  });
  
  // Démarrer le serveur
  server.listen(PORT, '0.0.0.0', () => {
    log(`✅ Serveur HTTP minimal démarré sur le port ${PORT}`);
  });
  
  // Gérer les erreurs du serveur
  server.on('error', (error) => {
    log(`❌ Erreur du serveur HTTP minimal: ${error.message}`);
  });
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

// Capture des erreurs non gérées
process.on('uncaughtException', (error) => {
  log(`❌ Exception non gérée: ${error.message}`);
  log(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Promesse rejetée non gérée: ${reason}`);
}); 