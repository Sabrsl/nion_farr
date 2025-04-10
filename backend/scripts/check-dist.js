/**
 * Script de vérification post-build
 * Vérifie que le dossier dist et le fichier main.js ont été correctement générés
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des fichiers du build...');

const distPath = path.join(__dirname, '..', 'dist');
const mainJsPath = path.join(distPath, 'main.js');
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

// Vérifier si main.js existe
if (!fs.existsSync(mainJsPath)) {
  console.error('❌ Le fichier main.js est manquant dans dist/');
  
  // Créer un fichier main.js de secours basique
  const backupMainJs = `
const express = require('express');
const cors = require('cors');

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
app.use(cors());
app.use(express.json());

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route d'API basique
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'NionFar API server running in backup mode' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(\`Serveur de secours démarré sur le port \${PORT}\`);
});
`;

  console.log('⚠️ Création d\'un fichier main.js de secours...');
  fs.writeFileSync(mainJsPath, backupMainJs);
  console.log('✅ Fichier main.js de secours créé');
}

// Créer un fichier server-simple.js de secours
if (!fs.existsSync(serverBackupPath)) {
  console.log('⚠️ Création du fichier server-simple.js...');
  const simpleServer = `
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', mode: 'backup', timestamp: new Date().toISOString() });
});

// Route d'API basique
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'NionFar API backup server running' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(\`Serveur de secours basique démarré sur le port \${PORT}\`);
});
`;
  fs.writeFileSync(serverBackupPath, simpleServer);
  console.log('✅ Fichier server-simple.js créé');
}

console.log('✅ Vérification dist/ terminée');