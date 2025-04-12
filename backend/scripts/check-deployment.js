/**
 * Script de vérification du déploiement Railway
 * - Vérifie la présence de tous les fichiers critiques
 * - S'assure que tous les imports sont correctement résolus
 * - Vérifie que les modules critiques sont accessibles
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Vérification du déploiement Railway...');

// Configuration
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 8080;

// Liste des fichiers critiques à vérifier
const criticalFiles = [
  'main.js',
  'app.module.js',
  'app.service.js',
  'app.controller.js',
  'common/logger/logger.module.js',
  'common/logger/structured-logger.service.js',
  'common/interceptors/http-exception.interceptor.js',
  'modules/users/users.module.js',
  'modules/auth/auth.module.js',
  'modules/auth/guards/jwt-auth.guard.js',
  'modules/auth/guards/roles.guard.js',
  'config/env.validation.js',
  'config/environment.js',
  'config/mongodb-memory-options.js'
];

// Vérification des fichiers critiques
console.log('🔍 Vérification des fichiers critiques...');
let missingFiles = [];
let existingFiles = [];

for (const file of criticalFiles) {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
    console.log(`✅ ${file} est présent`);
  } else {
    missingFiles.push(file);
    console.error(`❌ ${file} est manquant!`);
  }
}

// Statistiques
console.log(`\n📊 Statistiques des fichiers critiques:`);
console.log(`- Total vérifiés: ${criticalFiles.length}`);
console.log(`- Présents: ${existingFiles.length}`);
console.log(`- Manquants: ${missingFiles.length}`);

// Vérification des imports dans app.module.js
if (existingFiles.includes('app.module.js')) {
  console.log('\n🔍 Vérification des imports dans app.module.js...');
  const appModulePath = path.join(DIST_DIR, 'app.module.js');
  const content = fs.readFileSync(appModulePath, 'utf8');

  // Liste des imports critiques à vérifier
  const criticalImports = [
    './common/logger/logger.module.js',
    './common/interceptors/http-exception.interceptor.js',
    './config/env.validation.js',
    './config/environment.js'
  ];

  for (const importPath of criticalImports) {
    if (content.includes(importPath)) {
      console.log(`✅ Import ${importPath} trouvé`);
    } else {
      console.error(`❌ Import ${importPath} manquant!`);
    }
  }

  // Vérification du provider APP_FILTER
  if (content.includes('APP_FILTER') && content.includes('GlobalExceptionFilter')) {
    console.log('✅ Provider APP_FILTER correctement configuré');
  } else {
    console.error('❌ Provider APP_FILTER manquant ou mal configuré!');
  }
}

// Vérification des environnements
console.log('\n🔍 Vérification des variables d\'environnement...');
console.log(`- PORT: ${PORT}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`);
console.log(`- RAILWAY_DEPLOYMENT: ${process.env.RAILWAY_DEPLOYMENT || 'non défini'}`);
console.log(`- MEMORY_OPTIMIZED: ${process.env.MEMORY_OPTIMIZED || 'non défini'}`);

// Création des dossiers nécessaires
console.log('\n🔍 Création des dossiers nécessaires...');
const requiredDirs = [
  path.join(DIST_DIR, 'common', 'logger'),
  path.join(DIST_DIR, 'common', 'interceptors'),
  path.join(DIST_DIR, 'config'),
  path.join(DIST_DIR, 'modules', 'auth', 'decorators'),
  path.join(DIST_DIR, 'health'),
  'logs'
];

for (const dir of requiredDirs) {
  const fullPath = dir.startsWith(DIST_DIR) ? dir : path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`📁 Création du dossier ${dir}...`);
    fs.mkdirSync(fullPath, { recursive: true });
  } else {
    console.log(`✅ Dossier ${dir} existe déjà`);
  }
}

// Test de chargement de reflect-metadata
console.log('\n🔍 Test de chargement de reflect-metadata...');
try {
  require('reflect-metadata');
  console.log('✅ reflect-metadata chargé avec succès');
} catch (error) {
  console.error('❌ Erreur lors du chargement de reflect-metadata:', error.message);
}

// Exécution du script de correction de structure dist
console.log('\n🔍 Exécution du script fix-dist-structure.js...');
try {
  execSync('node scripts/fix-dist-structure.js', { stdio: 'inherit' });
  console.log('✅ Scripts de correction exécutés avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'exécution des scripts de correction:', error.message);
}

// Résumé final
if (missingFiles.length === 0) {
  console.log('\n✅ VÉRIFICATION RÉUSSIE: Tous les fichiers critiques sont présents');
} else {
  console.error('\n❌ VÉRIFICATION ÉCHOUÉE: Certains fichiers critiques sont manquants');
}

console.log('\n✨ Vérification du déploiement terminée!'); 