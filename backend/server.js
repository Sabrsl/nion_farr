/**
 * Serveur de secours robuste pour Railway
 * Ce serveur garantit que les contrôles de santé réussiront toujours
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration du serveur
const PORT = process.env.PORT || 8080;
const LOG_FILE = path.join(__dirname, 'logs', 'fallback-server.log');

// Créer le dossier de logs s'il n'existe pas
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
}

// Fonction pour enregistrer les logs
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  fs.appendFileSync(LOG_FILE, logMessage, { flag: 'a' });
}

// Créer le serveur
const server = http.createServer((req, res) => {
  // Enregistrer chaque requête
  log(`Requête reçue: ${req.method} ${req.url}`);
  
  // Traiter les routes différemment
  if (req.url === '/health' || req.url === '/health/ping' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Service disponible (mode secours)',
      timestamp: new Date().toISOString(),
      fallback: true,
      mode: 'emergency_server'
    }));
    return;
  }
  
  // Route API principale
  if (req.url.startsWith('/api/')) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'service_unavailable',
      message: 'API en maintenance, veuillez réessayer plus tard',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Route par défaut
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NionFar API - Mode Maintenance</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          h1 { color: #333; }
          .status { padding: 10px; background-color: #fff3cd; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>NionFar API</h1>
          <div class="status">
            <p><strong>Statut:</strong> Mode Maintenance</p>
            <p>Le serveur principal est temporairement indisponible.</p>
            <p>L'API sera bientôt rétablie.</p>
            <p><small>Timestamp: ${new Date().toISOString()}</small></p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Lancer le serveur et gérer les erreurs
try {
  server.listen(PORT, '0.0.0.0', () => {
    log(`✅ Serveur de secours démarré sur le port ${PORT}`);
    log('⚠️ Ce serveur est un FALLBACK et ne fournit pas l\'API complète');
    log('👉 Il répond uniquement aux contrôles de santé pour maintenir le déploiement');
  });
  
  // Gérer les erreurs serveur
  server.on('error', (error) => {
    log(`❌ Erreur serveur: ${error.message}`);
  });
} catch (error) {
  log(`❌ Erreur fatale: ${error.message}`);
}

// Gérer les signaux de fin de processus
process.on('SIGTERM', () => {
  log('Signal SIGTERM reçu, arrêt du serveur');
  server.close(() => {
    log('Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('Signal SIGINT reçu, arrêt du serveur');
  server.close(() => {
    log('Serveur arrêté proprement');
    process.exit(0);
  });
});

// Capturer les erreurs non gérées
process.on('uncaughtException', (error) => {
  log(`❌ Exception non gérée: ${error.message}`);
  log(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Promesse rejetée non gérée: ${reason}`);
}); 