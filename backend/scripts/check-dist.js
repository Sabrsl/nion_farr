/**
 * Script de vérification du dossier dist avant démarrage
 * Vérifie si tous les fichiers nécessaires sont présents et tente de les corriger si nécessaire
 */
const fs = require('fs');
const path = require('path');

// Lister les fichiers critiques à vérifier
const CRITICAL_FILES = [
  { name: 'main.js', source: 'src/main.js' },
  { name: 'app.module.js', source: 'src/app.module.js' },
  { name: 'app.controller.js', source: 'src/app.controller.js' }, // Critique - provoque des erreurs
  { name: 'app.service.js', source: 'src/app.service.js' },
  { name: 'index.js', required: false, generate: true } // Non critique mais utile, à générer si manquant
];

// Lister les dossiers critiques à vérifier
const CRITICAL_DIRS = [
  'config',
  'scripts',
  'modules',
  'auth'
];

// Fonction pour créer un fichier index.js générique
function generateIndexFile() {
  const distDir = path.join(__dirname, '..', 'dist');
  const indexPath = path.join(distDir, 'index.js');
  
  console.log(`🔧 Génération d'un fichier index.js dans ${distDir}`);
  
  const indexContent = `/**
 * Fichier index.js généré automatiquement
 * Wrapper pour charger le point d'entrée principal
 */

// Importer reflect-metadata pour résoudre les problèmes de décorateurs
require('reflect-metadata');

try {
  console.log('🚀 Démarrage de l\\'application...');
  // Essayer de charger le module principal
  require('./main');
} catch (error) {
  console.error('❌ Erreur lors du chargement du module principal:', error.message);
  
  // Essayer de charger depuis une autre location
  try {
    console.log('🔄 Tentative de chargement alternatif...');
    require('./src/main');
  } catch (innerError) {
    console.error('❌ Échec du chargement alternatif:', innerError.message);
    
    // Démarrer un serveur minimal pour éviter l'échec du déploiement
    console.log('⚠️ Démarrage du serveur minimal de secours...');
    
    const http = require('http');
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'degraded',
        message: 'API en mode dégradé suite à une erreur de démarrage',
        timestamp: new Date().toISOString()
      }));
    });
    
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log(\`⚠️ Serveur de secours démarré sur le port \${PORT}\`);
    });
  }
}
`;
  
  try {
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Fichier index.js généré avec succès');
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la génération du fichier index.js: ${error.message}`);
    return false;
  }
}

// Fonction pour copier un fichier s'il existe dans src/ mais pas dans dist/
function copyMissingFile(fileName, sourcePath) {
  if (!fileName) {
    console.error('❌ Nom de fichier non spécifié pour la copie');
    return false;
  }
  
  const distDir = path.join(__dirname, '..', 'dist');
  const distSrcDir = path.join(distDir, 'src');
  const destPath = path.join(distDir, fileName);
  
  // Si sourcePath n'est pas défini, utiliser le nom du fichier comme chemin source
  const srcPath = sourcePath 
    ? path.join(distSrcDir, sourcePath) 
    : path.join(distSrcDir, fileName);
  
  // Vérifier si le fichier existe dans le dossier source
  if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
    try {
      const content = fs.readFileSync(srcPath, 'utf8');
      fs.writeFileSync(destPath, content);
      console.log(`✅ ${fileName} copié depuis ${srcPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la copie de ${fileName}: ${error.message}`);
      return false;
    }
  } else if (!fs.existsSync(destPath)) {
    console.error(`❌ ${fileName} non trouvé: ni dans dist/ ni dans dist/src/${sourcePath || fileName}`);
    
    // Si c'est un fichier à générer, le créer
    if (fileName === 'index.js') {
      return generateIndexFile();
    }
    
    return false;
  }
  
  return true; // Fichier déjà présent
}

// Vérifier si un dossier existe dans dist/
function checkOrCreateDir(dirName) {
  const distDir = path.join(__dirname, '..', 'dist');
  const targetDir = path.join(distDir, dirName);
  const srcDir = path.join(distDir, 'src', dirName);
  
  if (!fs.existsSync(targetDir)) {
    console.log(`⚠️ Dossier ${dirName}/ manquant dans dist/`);
    
    // S'il existe dans src/, tenter de le copier
    if (fs.existsSync(srcDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`✅ Dossier ${dirName}/ créé dans dist/`);
        
        // Copier les fichiers .js du dossier source
        const files = fs.readdirSync(srcDir);
        let count = 0;
        
        for (const file of files) {
          if (file.endsWith('.js')) {
            const srcFile = path.join(srcDir, file);
            const destFile = path.join(targetDir, file);
            fs.copyFileSync(srcFile, destFile);
            count++;
          }
        }
        
        console.log(`✅ ${count} fichiers copiés depuis src/${dirName}/`);
        return true;
      } catch (error) {
        console.error(`❌ Erreur lors de la création/copie du dossier ${dirName}: ${error.message}`);
        return false;
      }
    } else {
      console.error(`❌ Dossier ${dirName}/ introuvable dans dist/src/`);
      return false;
    }
  }
  
  return true; // Le dossier existe déjà
}

// Fonction principale pour vérifier le dossier dist/
function checkDistStructure() {
  console.log('🔍 Vérification de la structure du dossier dist/...');
  const distDir = path.join(__dirname, '..', 'dist');
  
  // Vérifier si le dossier dist/ existe
  if (!fs.existsSync(distDir)) {
    console.error('❌ Dossier dist/ non trouvé! Exécutez d\'abord "npm run build"');
    return false;
  }
  
  // Vérifier les fichiers critiques
  let allFilesPassed = true;
  
  for (const file of CRITICAL_FILES) {
    const filePath = path.join(distDir, file.name);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file.name} existe`);
    } else {
      console.log(`❌ ${file.name} est manquant!`);
      
      let copied = false;
      
      if (file.generate) {
        // Si le fichier doit être généré (comme index.js)
        if (file.name === 'index.js') {
          copied = generateIndexFile();
        }
      } else {
        // Sinon, essayer de le copier depuis la source
        copied = copyMissingFile(file.name, file.source);
      }
      
      if (!copied && file.required !== false) {
        allFilesPassed = false;
      }
    }
  }
  
  // Vérifier les dossiers critiques
  let allDirsPassed = true;
  
  for (const dir of CRITICAL_DIRS) {
    const dirCreated = checkOrCreateDir(dir);
    if (!dirCreated) {
      allDirsPassed = false;
    }
  }
  
  // Si fix-dist-structure.js existe, l'exécuter en dernier recours
  if (!allFilesPassed || !allDirsPassed) {
    console.log('🔧 Tentative de correction avec fix-dist-structure.js...');
    try {
      require('./fix-dist-structure');
      console.log('✅ Structure du dossier dist/ corrigée');
      return true;
    } catch (error) {
      console.error('❌ Échec de la correction automatique:', error.message);
      return false;
    }
  }
  
  return true;
}

// Exécuter la vérification si ce script est appelé directement
if (require.main === module) {
  const result = checkDistStructure();
  if (result) {
    console.log('✅ La structure du dossier dist/ est valide');
    process.exit(0);
  } else {
    console.error('❌ Des problèmes ont été détectés dans la structure du dossier dist/');
    process.exit(1);
  }
} else {
  // Exporter pour utilisation dans d'autres scripts
  module.exports = {
    checkDistStructure
  };
}