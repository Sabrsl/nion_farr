/**
 * Script pour vérifier le fichier main.js après la compilation
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

// Vérifier si un fichier existe
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Fonction principale
const checkMainJs = () => {
  console.log(`${colors.blue}Vérification du fichier main.js...${colors.reset}`);
  
  // Chemins possibles pour main.js
  const paths = [
    path.join(__dirname, '..', 'dist', 'src', 'main.js'),
    path.join(__dirname, '..', 'dist', 'main.js')
  ];
  
  // Vérifier chaque chemin
  for (const filePath of paths) {
    if (fileExists(filePath)) {
      console.log(`${colors.green}✅ Fichier trouvé: ${filePath}${colors.reset}`);
      
      try {
        // Lire le fichier pour s'assurer qu'il n'est pas vide
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          console.error(`${colors.red}❌ Le fichier main.js est vide!${colors.reset}`);
          return false;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('NestFactory') && !content.includes('bootstrap')) {
          console.warn(`${colors.yellow}⚠️ Le fichier main.js ne semble pas contenir de code NestJS.${colors.reset}`);
        }
        
        console.log(`${colors.green}✅ Le fichier main.js semble valide (taille: ${stats.size} octets)${colors.reset}`);
        return true;
      } catch (error) {
        console.error(`${colors.red}❌ Erreur lors de la lecture du fichier: ${error.message}${colors.reset}`);
        return false;
      }
    }
  }
  
  console.error(`${colors.red}❌ Impossible de trouver le fichier main.js${colors.reset}`);
  return false;
};

// Exécuter la fonction principale si ce script est appelé directement
if (require.main === module) {
  const success = checkMainJs();
  process.exit(success ? 0 : 1);
}

module.exports = {
  checkMainJs
}; 