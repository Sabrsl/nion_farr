/**
 * Script de vérification de la structure du dossier dist après le build
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Vérifier si le dossier dist existe
log('Vérification du dossier dist...', colors.blue);
const distPath = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distPath)) {
  log('❌ Le dossier dist n\'existe pas!', colors.red);
  process.exit(1);
}

// Liste des fichiers critiques à vérifier
const criticalFiles = [
  'main.js',
  'app.module.js',
  'app.controller.js',
];

// Liste des dossiers critiques à vérifier
const criticalDirs = [
  'modules',
  'common',
  'health',
];

// Vérifier les fichiers critiques
let hasMissingFiles = false;

log('Vérification des fichiers critiques...', colors.blue);
for (const file of criticalFiles) {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    log(`✅ ${file} existe (${stats.size} octets)`, colors.green);
  } else {
    log(`❌ ${file} est manquant!`, colors.red);
    hasMissingFiles = true;
  }
}

// Vérifier les dossiers critiques
log('Vérification des dossiers critiques...', colors.blue);
for (const dir of criticalDirs) {
  const dirPath = path.join(distPath, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    log(`✅ ${dir}/ existe (${files.length} fichiers/dossiers)`, colors.green);
  } else {
    log(`❌ ${dir}/ est manquant!`, colors.red);
    hasMissingFiles = true;
  }
}

// Si des fichiers manquent, exécuter le script de correction
if (hasMissingFiles) {
  log('⚠️ Certains fichiers critiques sont manquants, tentative de correction...', colors.yellow);
  log('Exécution de fix-dist-structure.js...', colors.blue);
  
  try {
    require('./fix-dist-structure');
    log('✅ Correction appliquée avec succès', colors.green);
  } catch (error) {
    log(`❌ Erreur lors de la correction: ${error.message}`, colors.red);
    process.exit(1);
  }
  
  // Vérifier à nouveau après la correction
  let stillMissing = false;
  log('Vérification après correction...', colors.blue);
  
  for (const file of criticalFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      log(`❌ ${file} est toujours manquant après correction!`, colors.red);
      stillMissing = true;
    }
  }
  
  for (const dir of criticalDirs) {
    const dirPath = path.join(distPath, dir);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      log(`❌ ${dir}/ est toujours manquant après correction!`, colors.red);
      stillMissing = true;
    }
  }
  
  if (stillMissing) {
    log('❌ La correction n\'a pas résolu tous les problèmes!', colors.red);
    process.exit(1);
  }
}

log('✅ Structure du build validée avec succès!', colors.green); 