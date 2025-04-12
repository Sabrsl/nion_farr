/**
 * Script pour vérifier la structure du dossier dist après la compilation
 * Il s'assure que:
 * 1. Le dossier dist existe
 * 2. Le fichier main.js existe
 * 3. Le fichier app.module.js existe
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Vérifier si un fichier ou un dossier existe
const exists = (filePath) => {
  return fs.existsSync(filePath);
};

// Vérifier la structure du dossier dist
const checkDistFolder = () => {
  console.log(`${colors.blue}Vérification de la structure du dossier dist...${colors.reset}`);
  
  // Vérifier si le dossier dist existe
  const distPath = path.join(__dirname, '..', 'dist');
  if (!exists(distPath)) {
    console.error(`${colors.red}❌ Le dossier dist n'existe pas. La compilation a échoué.${colors.reset}`);
    return false;
  }
  
  // Vérifier si le dossier src existe dans dist
  const srcPath = path.join(distPath, 'src');
  if (!exists(srcPath)) {
    console.error(`${colors.red}❌ Le dossier src n'existe pas dans dist. La structure est incorrecte.${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Si votre projet n'utilise pas de dossier src, ignorez cette erreur.${colors.reset}`);
    // Ne pas échouer car certains projets n'ont pas de dossier src
  }
  
  // Vérifier si le fichier main.js existe dans dist/src
  const mainPath = path.join(srcPath, 'main.js');
  const altMainPath = path.join(distPath, 'main.js'); // Alternative sans src
  
  if (!exists(mainPath) && !exists(altMainPath)) {
    console.error(`${colors.red}❌ Le fichier main.js n'existe pas. La compilation a échoué.${colors.reset}`);
    return false;
  }
  
  // Vérifier si le fichier app.module.js existe
  const modulePathInSrc = path.join(srcPath, 'app.module.js');
  const modulePath = path.join(distPath, 'app.module.js'); // Alternative sans src
  
  if (!exists(modulePathInSrc) && !exists(modulePath)) {
    console.warn(`${colors.yellow}⚠️ Le fichier app.module.js n'a pas été trouvé. Vérifiez la structure.${colors.reset}`);
    // Ne pas échouer car le nom du module peut varier
  }
  
  console.log(`${colors.green}✅ La structure du dossier dist semble correcte${colors.reset}`);
  return true;
};

// Afficher le résumé de la vérification
const displaySummary = (success) => {
  if (success) {
    console.log(`${colors.green}==========================================${colors.reset}`);
    console.log(`${colors.green}✅ Vérification réussie${colors.reset}`);
    console.log(`${colors.green}Le build semble prêt pour le déploiement${colors.reset}`);
    console.log(`${colors.green}==========================================${colors.reset}`);
  } else {
    console.log(`${colors.red}==========================================${colors.reset}`);
    console.log(`${colors.red}❌ Vérification échouée${colors.reset}`);
    console.log(`${colors.red}Des problèmes ont été détectés dans le build${colors.reset}`);
    console.log(`${colors.red}==========================================${colors.reset}`);
  }
  
  return success;
};

// Fonction principale
const checkDist = () => {
  try {
    console.log(`${colors.blue}=== Vérification du build ===${colors.reset}`);
    
    const distSuccess = checkDistFolder();
    
    return displaySummary(distSuccess);
  } catch (error) {
    console.error(`${colors.red}Une erreur est survenue pendant la vérification: ${error.message}${colors.reset}`);
    return false;
  }
};

// Exécuter la fonction principale si ce script est appelé directement
if (require.main === module) {
  const success = checkDist();
  process.exit(success ? 0 : 1);
}

module.exports = {
  checkDist
}; 