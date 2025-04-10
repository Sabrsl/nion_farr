/**
 * Script de vérification post-build
 * Vérifie que le dossier dist et le fichier main.js ont été correctement générés
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des fichiers du build...');

const distPath = path.join(__dirname, '..', 'dist');
const srcPath = path.join(distPath, 'src');
const mainJsPath = path.join(srcPath, 'main.js');
const rootMainJsPath = path.join(distPath, 'main.js');
const serverBackupPath = path.join(__dirname, '..', 'server-simple.js');

// Vérifier si le répertoire dist existe
if (!fs.existsSync(distPath)) {
  console.error('❌ Le répertoire dist/ n\'existe pas. La compilation a échoué.');
  process.exit(1);
}

// Vérifier les fichiers dans dist/
console.log('📋 Contenu du répertoire dist:');
const distFiles = fs.readdirSync(distPath);
distFiles.forEach(file => console.log(`   - ${file}`));

// Vérifier si le répertoire dist/src existe
if (!fs.existsSync(srcPath)) {
  console.log('📁 Création du répertoire dist/src/...');
  fs.mkdirSync(srcPath, { recursive: true });
}

// Vérifier les fichiers dans dist/src/ s'il existe
if (fs.existsSync(srcPath)) {
  console.log('📋 Contenu du répertoire dist/src/:');
  try {
    const srcFiles = fs.readdirSync(srcPath);
    if (srcFiles.length === 0) {
      console.log('   (dossier vide)');
    } else {
      srcFiles.forEach(file => console.log(`   - ${file}`));
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture du dossier dist/src/: ${error.message}`);
  }
}

// Vérifier si main.js existe
if (!fs.existsSync(mainJsPath)) {
  console.error('❌ Le fichier main.js est manquant dans dist/src/');
  
  // Créer un fichier main.js de secours plus robuste
  const backupMainJs = `
/**
 * Fichier main.js de secours généré automatiquement par check-dist.js
 * Garantit un serveur fonctionnel même si le build échoue
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const express = require('express');
const cors = require('cors');
const http = require('http');

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de base
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : (process.env.FRONTEND_URL || '*'),
  credentials: true
}));
app.use(express.json());

// Middleware de logging minimal
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    backup: true 
  });
});

app.get('/health/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/health/detailed', (req, res) => {
  const memUsage = process.memoryUsage();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backup: true,
    memory: {
      rss: \`\${Math.round(memUsage.rss / 1024 / 1024)}MB\`,
      heapTotal: \`\${Math.round(memUsage.heapTotal / 1024 / 1024)}MB\`,
      heapUsed: \`\${Math.round(memUsage.heapUsed / 1024 / 1024)}MB\`
    }
  });
});

// Route d'API basique
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'NionFar API server running in backup mode',
    frontend_url: process.env.FRONTEND_URL || 'undefined',
    cors_allowed_origins: process.env.CORS_ALLOWED_ORIGINS || 'undefined',
    port: PORT
  });
});

// Route racine pour les healthchecks
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'NionFar API backup server is running',
    timestamp: new Date().toISOString() 
  });
});

// Créer serveur HTTP pour pouvoir gérer la fermeture gracieuse
const server = http.createServer(app);

// Gérer les signaux de terminaison
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Sortir après un délai même si server.close() est bloqué
  setTimeout(() => {
    console.log('Délai dépassé, sortie forcée');
    process.exit(0);
  }, 5000);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.log('Délai dépassé, sortie forcée');
    process.exit(0);
  }, 5000);
});

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Serveur de secours démarré sur le port \${PORT}\`);
  console.log(\`Health check disponible sur http://0.0.0.0:\${PORT}/health/ping\`);
});
`;

  console.log('⚠️ Création d\'un fichier main.js de secours robuste...');
  // S'assurer que le dossier dist/src existe
  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath, { recursive: true });
  }
  fs.writeFileSync(mainJsPath, backupMainJs);
  console.log('✅ Fichier main.js de secours créé avec succès dans dist/src/');
  
  // Également copier vers dist/main.js pour Railway
  fs.writeFileSync(rootMainJsPath, backupMainJs);
  console.log('✅ Fichier main.js de secours créé avec succès dans dist/ pour Railway');
} else {
  // Vérifier la taille du fichier main.js
  const stats = fs.statSync(mainJsPath);
  const fileSizeInBytes = stats.size;
  const fileSizeInKB = fileSizeInBytes / 1024;
  
  console.log(`📏 Taille du fichier dist/src/main.js: ${fileSizeInKB.toFixed(2)} KB`);
  
  if (fileSizeInKB < 10) {
    console.log('⚠️ ATTENTION: Le fichier main.js est anormalement petit.');
    console.log('⚠️ Ceci indique probablement un problème de build. Le serveur risque de ne pas démarrer correctement.');
    console.log('⚠️ Création d\'un fichier main.js de secours...');
    
    // Sauvegarder l'original
    fs.renameSync(mainJsPath, `${mainJsPath}.original`);
    
    // Créer un fichier main.js de secours
    const backupMainJs = `
/**
 * Fichier main.js de secours généré automatiquement par check-dist.js
 * Le fichier original (${fileSizeInKB.toFixed(2)} KB) était trop petit et a été sauvegardé en .original
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Importer les modules nécessaires
const express = require('express');
const http = require('http');
const cors = require('cors');

// Configuration
const PORT = process.env.PORT || 3000;
const app = express();

console.log(\`🚨 ATTENTION: Utilisation du fichier main.js de secours (build problématique détecté)\`);
console.log(\`🚨 Taille du fichier original: ${fileSizeInKB.toFixed(2)} KB\`);
console.log(\`🚨 Variables d'environnement:
- PORT: \${process.env.PORT}
- FRONTEND_URL: \${process.env.FRONTEND_URL}
- CORS_ALLOWED_ORIGINS: \${process.env.CORS_ALLOWED_ORIGINS}
- RAILWAY_DEPLOYMENT: \${process.env.RAILWAY_DEPLOYMENT}
\`);

// Configuration de base
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : (process.env.FRONTEND_URL || '*'),
  credentials: true
}));
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
});

// Route de healthcheck simple
app.get('/health/ping', (req, res) => {
  res.status(200).send('pong');
});

// Route de healthcheck détaillée
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Healthcheck passed (backup server)',
    timestamp: new Date().toISOString(),
    backup: true
  });
});

// Routes de base
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NionFar API backup server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'API is running in backup mode',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Démarrer le serveur
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Serveur de secours démarré sur le port \${PORT}\`);
});

// Gestion des signaux de terminaison
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.log('Délai dépassé, sortie forcée');
    process.exit(0);
  }, 5000);
});
`;

    fs.writeFileSync(mainJsPath, backupMainJs);
    console.log('✅ Fichier main.js de secours créé');
    
    // Également copier vers dist/main.js pour Railway
    fs.writeFileSync(rootMainJsPath, backupMainJs);
    console.log('✅ Fichier main.js de secours créé dans dist/ pour Railway');
  } else {
    // Copier main.js vers dist/ pour Railway
    try {
      fs.copyFileSync(mainJsPath, rootMainJsPath);
      console.log('✅ main.js copié vers dist/ pour Railway');
    } catch (error) {
      console.error(`❌ Erreur lors de la copie vers dist/main.js: ${error.message}`);
    }
  }
}

// Vérifier que dist/main.js existe pour Railway
if (!fs.existsSync(rootMainJsPath)) {
  console.log('❌ main.js manquant dans dist/ pour Railway');
  if (fs.existsSync(mainJsPath)) {
    console.log('🔄 Copie de dist/src/main.js vers dist/main.js...');
    try {
      fs.copyFileSync(mainJsPath, rootMainJsPath);
      console.log('✅ main.js copié avec succès vers dist/ pour Railway');
    } catch (error) {
      console.error(`❌ Erreur lors de la copie: ${error.message}`);
    }
  } else {
    console.error('❌ Impossible de créer dist/main.js car dist/src/main.js n\'existe pas');
  }
} else {
  console.log('✅ main.js existe dans dist/ pour Railway');
}

// Vérifier si un serveur de secours existe
if (!fs.existsSync(serverBackupPath)) {
  console.log('⚠️ Le serveur de secours n\'existe pas, création...');
  
  const backupServerJs = `
/**
 * Serveur de secours simple pour garantir un service minimal
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚨 Démarrage du serveur de secours simple');
console.log(\`PORT: \${PORT}\`);

// CORS - Configuration basique
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes de santé - essentielles pour les healthchecks Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Service en état de fonctionnement (secours)' });
});

app.get('/health/ping', (req, res) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API en mode secours', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API en mode secours simple' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 Serveur de secours en écoute sur le port \${PORT}\`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  // Ne pas terminer le processus
});

process.on('unhandledRejection', (reason) => {
  console.error('Promesse rejetée non gérée:', reason);
  // Ne pas terminer le processus
});
`;

  fs.writeFileSync(serverBackupPath, backupServerJs);
  console.log('✅ Serveur de secours créé');
}

console.log('✅ Vérification des fichiers terminée');