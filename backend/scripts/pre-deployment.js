/**
 * Script de pré-déploiement
 * Ce script effectue toutes les vérifications nécessaires avant un déploiement
 * - Validation des options de connexion MongoDB
 * - Vérification de la structure du code compilé
 * - Autres vérifications de pré-déploiement
 */

require('dotenv').config();
const { spawn } = require('child_process');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Fonction pour exécuter une commande npm
function runNpmScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.cyan}${colors.bold}Exécution de ${scriptName}...${colors.reset}`);
    
    const cmd = spawn('npm', ['run', scriptName], { 
      stdio: 'inherit',
      shell: true
    });
    
    cmd.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ ${scriptName} terminé avec succès${colors.reset}`);
        resolve(true);
      } else {
        console.error(`${colors.red}✗ ${scriptName} a échoué avec le code ${code}${colors.reset}`);
        resolve(false);
      }
    });
    
    cmd.on('error', (err) => {
      console.error(`${colors.red}✗ Erreur lors de l'exécution de ${scriptName}: ${err.message}${colors.reset}`);
      resolve(false);
    });
  });
}

// Fonction pour vérifier si un fichier existe
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// Fonction pour vérifier la présence de fichiers essentiels au déploiement
async function checkEssentialFiles() {
  console.log(`\n${colors.blue}${colors.bold}Vérification des fichiers essentiels...${colors.reset}`);
  
  const requiredFiles = [
    { path: path.join(__dirname, '..', 'dist', 'src', 'main.js'), name: 'Fichier principal dist/src/main.js' },
    { path: path.join(__dirname, '..', '.env'), name: 'Fichier .env' },
    { path: path.join(__dirname, '..', 'package.json'), name: 'Fichier package.json' }
  ];
  
  let allPresent = true;
  
  for (const file of requiredFiles) {
    if (checkFileExists(file.path)) {
      console.log(`${colors.green}✓ ${file.name} présent${colors.reset}`);
    } else {
      console.error(`${colors.red}✗ ${file.name} MANQUANT${colors.reset}`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// Fonction principale
async function runPreDeploymentChecks() {
  console.log(`\n${colors.magenta}${colors.bold}=== VÉRIFICATIONS PRÉ-DÉPLOIEMENT ===${colors.reset}\n`);
  
  // Liste des vérifications à effectuer
  const checks = [
    { name: 'Validation des options MongoDB', script: 'mongodb:validate-options' },
    { name: 'Vérification des fichiers essentiels', function: checkEssentialFiles }
  ];
  
  const results = [];
  
  // Exécuter chaque vérification
  for (const check of checks) {
    console.log(`\n${colors.yellow}${colors.bold}== ${check.name} ==${colors.reset}`);
    
    let success = false;
    if (check.script) {
      success = await runNpmScript(check.script);
    } else if (check.function) {
      success = await check.function();
    }
    
    results.push({ name: check.name, success });
  }
  
  // Afficher le résumé des résultats
  console.log(`\n${colors.blue}${colors.bold}=== RÉSUMÉ DES VÉRIFICATIONS ===${colors.reset}\n`);
  
  const allPassed = results.every(r => r.success);
  
  results.forEach(result => {
    if (result.success) {
      console.log(`${colors.green}✓ ${result.name}: OK${colors.reset}`);
    } else {
      console.error(`${colors.red}✗ ${result.name}: ÉCHEC${colors.reset}`);
    }
  });
  
  // Conclusion
  console.log(`\n${colors.magenta}${colors.bold}=== CONCLUSION ===${colors.reset}\n`);
  
  if (allPassed) {
    console.log(`${colors.green}${colors.bold}✓ TOUTES LES VÉRIFICATIONS ONT RÉUSSI${colors.reset}`);
    console.log(`${colors.green}L'application est prête à être déployée${colors.reset}`);
    return true;
  } else {
    console.error(`${colors.red}${colors.bold}✗ CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ${colors.reset}`);
    console.error(`${colors.red}Veuillez corriger les problèmes avant de déployer l'application${colors.reset}`);
    console.error(`${colors.yellow}Consultez les messages d'erreur ci-dessus pour plus de détails${colors.reset}`);
    return false;
  }
}

// Exécuter les vérifications pré-déploiement
runPreDeploymentChecks()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}${colors.bold}Erreur lors des vérifications pré-déploiement: ${error.message}${colors.reset}`);
    process.exit(1);
  }); 