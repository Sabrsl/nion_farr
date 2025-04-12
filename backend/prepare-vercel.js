/**
 * Script de préparation pour le déploiement sur Vercel
 * Ce script installe les dépendances nécessaires et prépare l'application NestJS
 * pour un déploiement en tant que fonction serverless sur Vercel.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Fonction pour afficher un message coloré
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Vérifier si le dossier 'api' existe
log('Vérification du dossier api...', colors.blue);
if (!fs.existsSync(path.join(__dirname, 'api'))) {
  log('Création du dossier api...', colors.yellow);
  fs.mkdirSync(path.join(__dirname, 'api'));
}

// Installer serverless-http si nécessaire
log('Vérification de l\'installation de serverless-http...', colors.blue);
try {
  log('Installation de serverless-http...', colors.yellow);
  execSync('npm install --save serverless-http', { stdio: 'inherit' });
  log('serverless-http installé avec succès', colors.green);
} catch (error) {
  log(`Erreur lors de l'installation de serverless-http: ${error.message}`, colors.red);
  process.exit(1);
}

// Compiler l'application NestJS
log('Compilation de l\'application NestJS...', colors.blue);
try {
  execSync('npm run build', { stdio: 'inherit' });
  log('Application compilée avec succès', colors.green);
} catch (error) {
  log(`Erreur lors de la compilation: ${error.message}`, colors.red);
  process.exit(1);
}

// Vérifier si le dossier 'dist' existe
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  log('Le dossier dist n\'existe pas. La compilation a échoué.', colors.red);
  process.exit(1);
}

// Vérifier si le fichier principal existe
const mainJsPath = path.join(__dirname, 'dist', 'src', 'main.js');
if (!fs.existsSync(mainJsPath)) {
  log(`Le fichier ${mainJsPath} n'existe pas. La compilation a échoué.`, colors.red);
  process.exit(1);
}

// Vérifier si le module principal existe
const appModulePath = path.join(__dirname, 'dist', 'src', 'app.module.js');
if (!fs.existsSync(appModulePath)) {
  log(`Le fichier ${appModulePath} n'existe pas. La compilation a échoué.`, colors.red);
  process.exit(1);
}

log('Préparation terminée avec succès', colors.green);
log('L\'application est prête pour le déploiement sur Vercel', colors.green);
log('N\'oubliez pas de configurer vos variables d\'environnement dans le Dashboard Vercel', colors.yellow); 