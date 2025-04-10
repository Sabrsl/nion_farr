/**
 * Script de vérification des variables d'environnement Railway
 * Pour diagnostiquer les problèmes de déploiement
 */

// Couleurs pour les logs
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';

// Fonction pour afficher un message avec une couleur
function colorize(color, message) {
  return `${color}${message}${RESET}`;
}

// Tableau des vérifications
const checks = [
  {
    name: 'FRONTEND_URL',
    expected: 'https://nion-farr.vercel.app',
    current: process.env.FRONTEND_URL,
    critical: true,
  },
  {
    name: 'CORS_ALLOWED_ORIGINS',
    expected: 'https://nion-farr.vercel.app,https://nionfar.up.railway.app',
    current: process.env.CORS_ALLOWED_ORIGINS,
    critical: true,
  },
  {
    name: 'APP_URL',
    expected: 'https://nionfar.up.railway.app',
    current: process.env.APP_URL,
    critical: true,
  },
  {
    name: 'PORT',
    expected: '8080',
    current: process.env.PORT,
    critical: true,
  },
  {
    name: 'NODE_ENV',
    expected: 'production',
    current: process.env.NODE_ENV,
    critical: false,
  },
  {
    name: 'API_PREFIX',
    expected: 'api',
    current: process.env.API_PREFIX,
    critical: false,
  },
  {
    name: 'RAILWAY_DEPLOYMENT',
    expected: 'true',
    current: process.env.RAILWAY_DEPLOYMENT,
    critical: false,
  },
  {
    name: 'MONGODB_URI',
    expected: 'défini',
    current: process.env.MONGODB_URI ? 'défini' : 'non défini',
    critical: true,
  },
  {
    name: 'JWT_SECRET',
    expected: 'défini',
    current: process.env.JWT_SECRET ? 'défini' : 'non défini',
    critical: true,
  },
  {
    name: 'JWT_REFRESH_SECRET',
    expected: 'défini',
    current: process.env.JWT_REFRESH_SECRET ? 'défini' : 'non défini',
    critical: true,
  },
];

// Entête
console.log(colorize(MAGENTA, '='.repeat(80)));
console.log(colorize(MAGENTA, '     VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT RAILWAY'));
console.log(colorize(MAGENTA, '='.repeat(80)));

// Vérifier le fichier dist/main.js
try {
  const fs = require('fs');
  const path = require('path');
  const mainJsPath = path.join(__dirname, '..', 'dist', 'main.js');
  
  if (fs.existsSync(mainJsPath)) {
    const stats = fs.statSync(mainJsPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    
    console.log(`\n${colorize(BLUE, '📁 Fichier main.js:')} ${fileSizeInKB.toFixed(2)} KB`);
    
    if (fileSizeInKB < 5) {
      console.log(colorize(RED, `⚠️ ALERTE: Le fichier main.js est trop petit (${fileSizeInKB.toFixed(2)} KB)`));
    } else {
      console.log(colorize(GREEN, '✅ Taille du fichier main.js OK'));
    }
  } else {
    console.log(colorize(RED, '❌ Le fichier main.js n\'existe pas!'));
  }
} catch (error) {
  console.error(colorize(RED, `❌ Erreur lors de la vérification du fichier main.js: ${error.message}`));
}

// Afficher le tableau des résultats
console.log('\n');
console.log(colorize(BLUE, '📋 VARIABLES D\'ENVIRONNEMENT:'));
console.log(colorize(CYAN, '='.repeat(80)));
console.log(colorize(CYAN, `| ${'Variable'.padEnd(25)} | ${'État'.padEnd(10)} | ${'Attendu'.padEnd(35)} |`));
console.log(colorize(CYAN, '='.repeat(80)));

let criticalErrors = 0;
let warnings = 0;

checks.forEach(check => {
  const match = check.current === check.expected;
  const status = match ? colorize(GREEN, '✅ OK') : (check.critical ? colorize(RED, '❌ ERREUR') : colorize(YELLOW, '⚠️ ALERTE'));
  
  if (!match && check.critical) criticalErrors++;
  if (!match && !check.critical) warnings++;
  
  console.log(colorize(CYAN, `| ${check.name.padEnd(25)} | ${status.padEnd(20)} | ${check.expected.padEnd(35)} |`));
});

console.log(colorize(CYAN, '='.repeat(80)));

// Résumé
console.log('\n');
console.log(colorize(BLUE, '📊 RÉSUMÉ:'));
if (criticalErrors === 0 && warnings === 0) {
  console.log(colorize(GREEN, '✅ Toutes les variables sont correctement configurées!'));
} else {
  if (criticalErrors > 0) {
    console.log(colorize(RED, `❌ ${criticalErrors} erreur(s) critique(s) détectée(s)!`));
  }
  if (warnings > 0) {
    console.log(colorize(YELLOW, `⚠️ ${warnings} alerte(s) non critique(s) détectée(s).`));
  }
}

// Instructions
if (criticalErrors > 0) {
  console.log('\n');
  console.log(colorize(BLUE, '🔧 INSTRUCTIONS POUR CORRIGER:'));
  console.log(colorize(MAGENTA, '1. Connectez-vous à Railway (https://railway.app)'));
  console.log(colorize(MAGENTA, '2. Accédez à votre projet "nionfar"'));
  console.log(colorize(MAGENTA, '3. Sélectionnez votre service backend'));
  console.log(colorize(MAGENTA, '4. Allez dans l\'onglet "Variables"'));
  console.log(colorize(MAGENTA, '5. Modifiez les variables critiques indiquées ci-dessus'));
  console.log(colorize(MAGENTA, '6. Cliquez sur "Deploy" pour appliquer les changements'));
}

// Sortir avec un code d'erreur si nécessaire
process.exit(criticalErrors > 0 ? 1 : 0); 