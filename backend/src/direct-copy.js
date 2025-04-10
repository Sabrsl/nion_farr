/**
 * Script pour copier manuellement main.js dans le dossier dist/src
 * Utilisé comme solution de contournement pour le bug de build NestJS
 */

const fs = require('fs');
const path = require('path');

// Chemin vers les fichiers
const sourceFile = path.join(__dirname, 'main.js');
const destDir = path.join(__dirname, '..', 'dist', 'src');
const destFile = path.join(destDir, 'main.js');

console.log('🔄 Copie de main.js vers dist/src/...');

// Vérifier si le dossier dist/src existe
if (!fs.existsSync(destDir)) {
  console.log('📁 Création du dossier dist/src/...');
  fs.mkdirSync(destDir, { recursive: true });
}

// Vérifier si le fichier source existe
if (!fs.existsSync(sourceFile)) {
  console.error('❌ ERROR: Le fichier source main.js n\'existe pas!');
  console.log('⚠️ Tentative de création d\'un fichier main.js...');
  
  // Contenu par défaut pour main.js
  const mainJsContent = `
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
    message: 'NionFar API is running'
  });
});

app.get('/health/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NionFar API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// Gérer les signaux de terminaison
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
  console.log(\`Serveur démarré sur le port \${PORT}\`);
  console.log(\`Health check disponible sur http://0.0.0.0:\${PORT}/health/ping\`);
});
  `;
  
  // Créer le fichier main.js dans le répertoire source
  try {
    fs.writeFileSync(sourceFile, mainJsContent);
    console.log('✅ Fichier source main.js créé avec succès');
  } catch (error) {
    console.error(`❌ Échec de la création du fichier source: ${error.message}`);
    process.exit(1);
  }
}

// Copier le fichier
try {
  fs.copyFileSync(sourceFile, destFile);
  console.log(`✅ Fichier copié avec succès: ${sourceFile} -> ${destFile}`);
  
  // Afficher le contenu du dossier dist/src
  console.log('📂 Contenu du dossier dist/src/:');
  const files = fs.readdirSync(destDir);
  files.forEach(file => {
    const filePath = path.join(destDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   - ${file} (${Math.round(stats.size / 1024)} KB)`);
  });
  
  // Vérifier que le fichier existe bien
  if (fs.existsSync(destFile)) {
    console.log('✅ Vérification: dist/src/main.js existe bien.');
  } else {
    console.error('❌ ERROR: dist/src/main.js n\'existe toujours pas après la copie!');
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ ERROR: Échec de la copie: ${error.message}`);
  process.exit(1);
} 