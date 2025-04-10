/**
 * Serveur de secours minimal pour Railway
 * Utilisé uniquement si l'application principale échoue
 */

'use strict';

console.log('🔄 Serveur de secours démarré');
console.log('Environment:', process.env.NODE_ENV);

const http = require('http');
const fs = require('fs');
const path = require('path');

// Variables
const PORT = process.env.PORT || 3000;

// Fonction pour écrire des logs
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  console.log(logEntry);
  
  try {
    fs.appendFileSync(path.join(__dirname, 'logs', 'backup-server.log'), logEntry);
  } catch (err) {
    console.error('Impossible d\'écrire dans le fichier de log:', err);
  }
}

// Essayer de capturer pourquoi l'application principale a échoué
try {
  if (fs.existsSync(path.join(__dirname, 'dist', 'main.js'))) {
    writeLog('✅ Le fichier main.js existe');
  } else {
    writeLog('❌ Le fichier main.js n\'existe pas!');
  }
  
  // Liste les fichiers du dossier dist
  writeLog('📂 Contenu du dossier dist:');
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    const files = fs.readdirSync(path.join(__dirname, 'dist'));
    writeLog(files.join(', '));
  } else {
    writeLog('❌ Le dossier dist n\'existe pas!');
  }
  
  // Vérifier les variables d'environnement critiques
  writeLog('🔑 Variables d\'environnement:');
  writeLog(`PORT=${process.env.PORT}`);
  writeLog(`NODE_ENV=${process.env.NODE_ENV}`);
  writeLog(`RAILWAY_DEPLOYMENT=${process.env.RAILWAY_DEPLOYMENT}`);
  writeLog(`MONGODB_URI existe: ${Boolean(process.env.MONGODB_URI)}`);
  writeLog(`JWT_SECRET existe: ${Boolean(process.env.JWT_SECRET)}`);
  writeLog(`FRONTEND_URL=${process.env.FRONTEND_URL}`);
  writeLog(`CORS_ALLOWED_ORIGINS=${process.env.CORS_ALLOWED_ORIGINS}`);
} catch (err) {
  writeLog(`❌ Erreur lors de la vérification: ${err.message}`);
}

// Créer un serveur HTTP simple
const server = http.createServer((req, res) => {
  writeLog(`📝 ${req.method} ${req.url}`);
  
  // Endpoint de santé
  if (req.url === '/health' || req.url === '/health/ping') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Backup server responding',
      timestamp: new Date().toISOString(),
      isBackupServer: true
    }));
    return;
  }
  
  // Redirection vers l'API
  if (req.url.startsWith('/api')) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'error',
      message: 'API Service temporarily unavailable - backup server running',
      timestamp: new Date().toISOString() 
    }));
    return;
  }
  
  // Page d'accueil
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NionFar API - Backup Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .status { padding: 20px; background: #f8f8f8; border-left: 4px solid #e74c3c; }
          .info { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>NionFar API</h1>
          <div class="status">
            <h2>Mode de secours actif</h2>
            <p>Le serveur principal est actuellement indisponible.</p>
            <p>Le serveur de secours est actif pour maintenir les healthchecks.</p>
          </div>
          <div class="info">
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Environnement: ${process.env.NODE_ENV || 'development'}</p>
            <p>Port: ${PORT}</p>
            <p>CORS configuré pour: ${process.env.CORS_ALLOWED_ORIGINS || 'Non défini'}</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
  writeLog(`🔄 Serveur de secours en écoute sur le port ${PORT}`);
  writeLog(`👉 Healthcheck disponible sur: http://0.0.0.0:${PORT}/health`);
});

// Gestion des erreurs
server.on('error', (error) => {
  writeLog(`❌ Erreur du serveur: ${error.message}`);
  process.exit(1);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  writeLog('👋 Signal SIGTERM reçu, arrêt du serveur de secours...');
  server.close(() => {
    writeLog('👍 Serveur de secours arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  writeLog('👋 Signal SIGINT reçu, arrêt du serveur de secours...');
  server.close(() => {
    writeLog('👍 Serveur de secours arrêté proprement');
    process.exit(0);
  });
}); 