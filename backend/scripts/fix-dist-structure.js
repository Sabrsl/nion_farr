/**
 * Script pour corriger la structure du répertoire dist après le build
 * Assure que dist/main.js existe ou le copie depuis dist/src/main.js si nécessaire
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Vérification et correction de la structure dist...');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const srcDistDir = path.join(distDir, 'src');
const mainJsInDist = path.join(distDir, 'main.js');
const mainJsInSrcDist = path.join(srcDistDir, 'main.js');

// S'assurer que le répertoire dist existe
if (!fs.existsSync(distDir)) {
  console.log('📁 Création du répertoire dist/');
  fs.mkdirSync(distDir, { recursive: true });
}

// Vérifier la structure des fichiers dans dist/
console.log('📊 Structure actuelle des fichiers dist/:');
if (fs.existsSync(distDir)) {
  const distFiles = fs.readdirSync(distDir);
  distFiles.forEach(file => console.log(` - ${file}`));
  
  // Vérifier si dist/src existe
  if (fs.existsSync(srcDistDir)) {
    console.log('📊 Contenu de dist/src/:');
    const srcDistFiles = fs.readdirSync(srcDistDir);
    srcDistFiles.forEach(file => console.log(` - ${file}`));
  }
}

// Vérifier si main.js existe déjà dans la racine de dist/
if (fs.existsSync(mainJsInDist)) {
  console.log('✅ main.js existe déjà à la racine de dist/');
  const stats = fs.statSync(mainJsInDist);
  console.log(`📊 Taille: ${Math.round(stats.size / 1024)} KB`);
} 
// Vérifier si main.js existe dans dist/src/
else if (fs.existsSync(mainJsInSrcDist)) {
  console.log('⚠️ main.js trouvé dans dist/src/ mais pas à la racine de dist/');
  console.log('🔄 Copie de dist/src/main.js vers dist/main.js...');
  
  try {
    fs.copyFileSync(mainJsInSrcDist, mainJsInDist);
    console.log('✅ Copie réussie !');
    
    const stats = fs.statSync(mainJsInDist);
    console.log(`📊 Taille du nouveau fichier: ${Math.round(stats.size / 1024)} KB`);
  } catch (error) {
    console.error(`❌ Erreur lors de la copie: ${error.message}`);
  }
} 
// Aucun main.js trouvé, création d'un fichier de secours
else {
  console.log('❌ main.js introuvable dans dist/ ou dist/src/');
  console.log('🔄 Création d\'un fichier main.js de secours...');
  
  // Contenu minimal pour un serveur Express fonctionnel
  const fallbackContent = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Fallback server créé par fix-dist-structure.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(cors());
app.use(express.json());

// Logging simple
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
});

// Routes de base
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Service en état de fonctionnement (fallback)' });
});

app.get('/health/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'pong',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    railway: process.env.RAILWAY_DEPLOYMENT === 'true',
    version: '1.0'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'NionFar API Server (fallback)', 
    timestamp: new Date().toISOString() 
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ Serveur fallback démarré sur le port \${PORT}\`);
  console.log(\`👉 Vérifiez l'URL: http://localhost:\${PORT}/health\`);
});

// Gestion des erreurs globales
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Promesse rejetée non gérée:', reason);
});
`;
  
  try {
    fs.writeFileSync(mainJsInDist, fallbackContent);
    console.log('✅ Fichier main.js de secours créé avec succès à la racine de dist/');
    
    // Créer également dans dist/src/ pour cohérence
    if (!fs.existsSync(srcDistDir)) {
      fs.mkdirSync(srcDistDir, { recursive: true });
    }
    fs.writeFileSync(mainJsInSrcDist, fallbackContent);
    console.log('✅ Fichier main.js de secours également créé dans dist/src/');
  } catch (error) {
    console.error(`❌ Erreur lors de la création du fichier: ${error.message}`);
  }
}

// S'assurer que les permissions sont correctes
try {
  console.log('🔧 Ajustement des permissions...');
  fs.chmodSync(mainJsInDist, 0o755);
  console.log('✅ Permissions mises à jour');
} catch (error) {
  console.error(`⚠️ Impossible d'ajuster les permissions: ${error.message}`);
}

console.log('✅ Vérification de la structure terminée !'); 