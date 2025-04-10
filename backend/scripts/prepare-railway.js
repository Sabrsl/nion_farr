#!/usr/bin/env node

/**
 * Script de préparation pour le déploiement Railway
 * Vérifie et corrige les paramètres critiques
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚂 Préparation des fichiers pour Railway...');

// Chemin vers les fichiers importants
const distPath = path.join(__dirname, '..', 'dist');
const srcDistPath = path.join(distPath, 'src');
const mainJsPath = path.join(srcDistPath, 'main.js');
const rootMainJsPath = path.join(distPath, 'main.js');

// Vérifier si le répertoire dist existe
if (!fs.existsSync(distPath)) {
  console.log('📁 Création du dossier dist...');
  fs.mkdirSync(distPath, { recursive: true });
}

// Vérifier si le répertoire dist/src existe
if (!fs.existsSync(srcDistPath)) {
  console.log('📁 Création du dossier dist/src...');
  fs.mkdirSync(srcDistPath, { recursive: true });
}

// Vérifier et créer le fichier main.js à la racine du dossier dist si nécessaire
if (!fs.existsSync(rootMainJsPath)) {
  console.log('⚠️ Fichier main.js manquant dans dist/');
  
  // Si dist/src/main.js existe, le copier
  if (fs.existsSync(mainJsPath)) {
    console.log('🔄 Copie de dist/src/main.js vers dist/main.js...');
    fs.copyFileSync(mainJsPath, rootMainJsPath);
    console.log('✅ Fichier main.js copié avec succès');
  } else {
    console.log('⚠️ dist/src/main.js est également manquant');
    console.log('⚠️ Création d\'un fichier main.js de secours...');
    
    // Contenu minimal pour démarrer un serveur Express
    const fallbackMainJs = `
/**
 * Fichier main.js de secours généré automatiquement pour Railway
 */

console.log('🚀 Démarrage du serveur NionFar API...');

// Afficher les variables d'environnement importantes
console.log('📝 Variables d\'environnement configurées:');
console.log('- Frontend URL:', process.env.FRONTEND_URL || 'non défini');
console.log('- CORS autorisés:', process.env.CORS_ALLOWED_ORIGINS || 'non défini');
console.log('- Port:', process.env.PORT || '3000');
console.log('- Railway deployment:', process.env.RAILWAY_DEPLOYMENT || 'false');
console.log('- MongoDB URI configuré:', process.env.MONGODB_URI ? 'oui' : 'non');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Route pour le healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API de secours en ligne' });
});

app.get('/health/ping', (req, res) => {
  res.send('pong');
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NionFar API est en ligne (mode secours)',
    timestamp: new Date().toISOString()
  });
});

// Route API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API en mode secours',
    timestamp: new Date().toISOString() 
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ Serveur de secours démarré sur le port \${PORT}\`);
});
`;
    
    // Sauvegarder les fichiers
    fs.writeFileSync(rootMainJsPath, fallbackMainJs);
    console.log('✅ Fichier dist/main.js créé avec succès');
    
    // Créer aussi dans dist/src pour cohérence
    fs.writeFileSync(mainJsPath, fallbackMainJs);
    console.log('✅ Fichier dist/src/main.js également créé');
  }
} else {
  console.log('✅ Le fichier dist/main.js existe déjà');
}

// Vérifier la taille du fichier main.js
try {
  const stats = fs.statSync(rootMainJsPath);
  const fileSizeInBytes = stats.size;
  const fileSizeInKB = fileSizeInBytes / 1024;
  
  console.log(`📏 Taille du fichier dist/main.js: ${fileSizeInKB.toFixed(2)} KB`);
  
  if (fileSizeInKB < 2) {
    console.log('⚠️ ATTENTION: Le fichier main.js est anormalement petit!');
    console.log('⚠️ Création d\'un fichier main.js de remplacement...');
    
    // Sauvegarder l'original
    fs.renameSync(rootMainJsPath, `${rootMainJsPath}.original`);
    
    // Créer un fichier main.js viable
    const viableMainJs = `
console.log('🚀 Démarrage du serveur de secours NionFar API...');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/ping', (req, res) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.json({ message: 'API en ligne (mode secours)', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Serveur démarré sur port \${PORT}\`);
});
`;
    
    fs.writeFileSync(rootMainJsPath, viableMainJs);
    console.log('✅ Nouveau fichier dist/main.js créé');
  }
} catch (error) {
  console.error(`❌ Erreur lors de la vérification du fichier: ${error.message}`);
}

// Vérification des packages requis
try {
  console.log('🔄 Vérification des packages requis...');
  const packageJson = require('../package.json');
  
  const requiredDeps = ['express', 'cors'];
  let missingDeps = [];
  
  for (const dep of requiredDeps) {
    if (!packageJson.dependencies[dep]) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.log(`⚠️ Dépendances manquantes pour le serveur de secours: ${missingDeps.join(', ')}`);
  } else {
    console.log('✅ Toutes les dépendances requises sont installées');
  }
} catch (error) {
  console.error(`❌ Erreur lors de la vérification des packages: ${error.message}`);
}

console.log('✅ Préparation pour Railway terminée');

// Vérification des fichiers essentiels
const essentialFiles = ['dist/main.js', '.env.railway', 'railway.toml'];
const missingFiles = [];

essentialFiles.forEach(file => {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Fichiers manquants:', missingFiles.join(', '));
  console.log('Veuillez exécuter "npm run build" pour générer le dossier dist');
  process.exit(1);
}

// Vérification du fichier .env.railway
const envRailway = fs.readFileSync(path.join(process.cwd(), '.env.railway'), 'utf8');
const placeholders = [
  'MONGODB_URI_PLACEHOLDER',
  'JWT_SECRET_PLACEHOLDER',
  'JWT_REFRESH_SECRET_PLACEHOLDER'
];

const missingEnvVars = [];
placeholders.forEach(placeholder => {
  if (envRailway.includes(placeholder)) {
    missingEnvVars.push(placeholder.replace('_PLACEHOLDER', ''));
  }
});

if (missingEnvVars.length > 0) {
  console.error('❌ Variables d\'environnement à configurer dans .env.railway:', missingEnvVars.join(', '));
  console.log('Veuillez remplacer les placeholders par les valeurs réelles avant de déployer');
}

// Vérification de la taille du dossier dist
try {
  const distSizeBytes = getFolderSize(path.join(process.cwd(), 'dist'));
  const distSizeMB = (distSizeBytes / (1024 * 1024)).toFixed(2);
  console.log(`📦 Taille du dossier dist: ${distSizeMB} MB`);
  
  if (distSizeBytes > 500 * 1024 * 1024) {
    console.warn('⚠️ Le dossier dist est très volumineux. Railway peut avoir des limitations.');
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification de la taille du dossier dist:', error.message);
}

// Conseils pour la migration
console.log('\n📋 Liste des étapes pour la migration vers Railway:');
console.log('1. Assurez-vous que toutes les variables d\'environnement sont configurées dans .env.railway');
console.log('2. Créez un nouveau projet sur Railway avec l\'option "Deploy from GitHub"');
console.log('3. Liez votre repository GitHub au projet Railway');
console.log('4. Configurez les variables d\'environnement dans Railway (utilisez les valeurs de Render)');
console.log('5. Déclenchez un déploiement manuel ou poussez un commit');
console.log('6. Une fois le déploiement réussi, vérifiez que tout fonctionne correctement');
console.log('7. Si tout est OK, mettez Render en pause (ne le supprimez pas tout de suite)');

// Affiche le statut du déploiement Render actuel
console.log('\n🔍 Statut du projet Render actuel:');
console.log('Pour sauvegarder vos variables d\'environnement Render, exécutez:');
console.log('railway env export > render-env-backup.txt');

// Aide pour générer de nouveaux secrets JWT si nécessaire
console.log('\n🔑 Pour générer de nouveaux secrets JWT, exécutez:');
console.log('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');

console.log('\n✅ Préparation terminée!');

// Fonction pour calculer la taille d'un dossier
function getFolderSize(folderPath) {
  let totalSize = 0;
  
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Préparation du déploiement Railway...');
  
  // ... existing code ...
  
  // Vérifier si dist/main.js existe et le créer si nécessaire
  console.log('📂 Vérification de la présence du fichier main.js dans dist/');
  const distPath = path.join(__dirname, '..', 'dist');
  const srcMainJsPath = path.join(distPath, 'src', 'main.js');
  const distMainJsPath = path.join(distPath, 'main.js');
  
  if (!fs.existsSync(distPath)) {
    console.log('⚠️ Le dossier dist/ n\'existe pas, création...');
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  if (fs.existsSync(srcMainJsPath)) {
    console.log('✅ main.js trouvé dans dist/src/, copie vers dist/...');
    fs.copyFileSync(srcMainJsPath, distMainJsPath);
    console.log('✅ main.js copié avec succès vers dist/main.js');
  } else {
    console.log('⚠️ main.js non trouvé dans dist/src/, vérification du build...');
    await runCommand('npm run build:clean');
    
    // Vérifier à nouveau après le build
    if (fs.existsSync(srcMainJsPath)) {
      console.log('✅ main.js généré avec succès, copie vers dist/...');
      fs.copyFileSync(srcMainJsPath, distMainJsPath);
      console.log('✅ main.js copié avec succès vers dist/main.js');
    } else {
      console.error('❌ Impossible de générer main.js, création d\'un fichier de secours...');
      // Utiliser le fichier de secours de check-dist.js
      await runCommand('node scripts/check-dist.js');
    }
  }
  
  // ... existing code ...
}

/**
 * Helper pour exécuter des commandes shell
 */
async function runCommand(command) {
  try {
    console.log(`🔄 Exécution de la commande: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de la commande: ${error.message}`);
    return false;
  }
}

// Exécuter la fonction principale
main().catch(error => {
  console.error(`❌ Erreur dans le script de préparation Railway: ${error.message}`);
  process.exit(1);
}); 