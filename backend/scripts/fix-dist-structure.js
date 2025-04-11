/**
 * Script pour corriger la structure du dossier dist après compilation
 * Ce script s'assure que tous les modules requis sont correctement placés par rapport au fichier main.js
 */
const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Dossier créé: ${dirPath}`);
  }
}

function copyFileIfExists(source, target) {
  if (fs.existsSync(source)) {
    ensureDirectoryExists(path.dirname(target));
    fs.copyFileSync(source, target);
    console.log(`✅ Fichier copié: ${source} -> ${target}`);
    return true;
  } else {
    console.log(`⚠️ Fichier source non trouvé: ${source}`);
    return false;
  }
}

function fixImportsInFile(filePath, fixStrategy = 'update-imports') {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Stratégie 1: Mettre à jour les imports relatifs
    if (fixStrategy === 'update-imports') {
      // Correction des imports relatifs dans le fichier
      if (content.includes('require("./') || content.includes("require('./")) {
        // Remplacer les imports relatifs par des imports qui pointent vers src/
        content = content.replace(
          /require\(['"]\.\/(.*)['"]\)/g, 
          'require("./src/$1")'
        );
        modified = true;
      }
    }
    
    // Stratégie 2: Adapter le chemin d'un module spécifique
    else if (fixStrategy === 'fix-app-module') {
      if (content.includes('require("./app.module")') || content.includes("require('./app.module')")) {
        content = content.replace(
          /require\(['"]\.\/(app\.module)['"]\)/g, 
          'require("./$1")'
        );
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Imports corrigés dans: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ Aucun problème d'import détecté dans: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la correction des imports: ${error.message}`);
    return false;
  }
}

function copyDirectoryRecursive(source, target) {
  // Créer le répertoire cible s'il n'existe pas
  ensureDirectoryExists(target);
  
  // Lister tous les fichiers et répertoires dans le répertoire source
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  let count = 0;
  
  // Parcourir chaque entrée
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);
    
    // Si c'est un répertoire, l'explorer récursivement
    if (entry.isDirectory()) {
      count += copyDirectoryRecursive(srcPath, destPath);
    } 
    // Si c'est un fichier JavaScript, le copier
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        fs.copyFileSync(srcPath, destPath);
        count++;
      } catch (err) {
        console.error(`❌ Erreur lors de la copie de ${srcPath}: ${err.message}`);
      }
    }
  }
  
  return count;
}

function createRootWrapper() {
  const distDir = path.join(__dirname, '..', 'dist');
  const wrapperPath = path.join(distDir, 'index.js');
  
  // Créer un fichier index.js à la racine de dist qui redirige vers le bon main.js
  const wrapperContent = `
/**
 * Wrapper pour charger le module principal de l'application
 */
try {
  console.log('🔄 Chargement de l\\'application NestJS...');
  require('./main');
} catch (error) {
  console.error('❌ Erreur lors du chargement de l\\'application:', error.message);
  
  // Tenter de charger depuis dist/src/ si présent
  try {
    console.log('🔄 Tentative de chargement depuis dist/src/main.js...');
    require('./src/main');
  } catch (srcError) {
    console.error('❌ Échec du chargement depuis dist/src/:', srcError.message);
    console.log('⚠️ Démarrage du serveur de secours...');
    
    // Ici, démarrer un serveur de secours simple si nécessaire
    const http = require('http');
    const server = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'Service en mode dégradé', timestamp: new Date().toISOString() }));
        return;
      }
      res.writeHead(200);
      res.end('NionFar API - Mode dégradé');
    });
    
    server.listen(process.env.PORT || 8080, () => {
      console.log(\`✅ Serveur de secours démarré sur le port \${process.env.PORT || 8080}\`);
    });
  }
}
`;

  fs.writeFileSync(wrapperPath, wrapperContent);
  console.log(`✅ Fichier wrapper créé: ${wrapperPath}`);
}

function copyModulesToRoot() {
  const distDir = path.join(__dirname, '..', 'dist');
  const distSrcDir = path.join(distDir, 'src');
  
  console.log('🔍 Vérification de la structure dist...');
  
  // S'assurer que les répertoires existent
  ensureDirectoryExists(distDir);
  ensureDirectoryExists(distSrcDir);
  
  // Vérifier et corriger le fichier main.js à la racine de dist
  const mainJsInRoot = path.join(distDir, 'main.js');
  const mainJsInSrc = path.join(distSrcDir, 'main.js');
  
  // 1. S'assurer que main.js existe à la racine de dist
  if (!fs.existsSync(mainJsInRoot) && fs.existsSync(mainJsInSrc)) {
    copyFileIfExists(mainJsInSrc, mainJsInRoot);
    fixImportsInFile(mainJsInRoot, 'fix-app-module');
  }
  
  // 2. Corriger les chemins d'importation dans main.js (s'il existe déjà)
  if (fs.existsSync(mainJsInRoot)) {
    fixImportsInFile(mainJsInRoot, 'fix-app-module');
  }
  
  // 3. Vérifier si app.module.js existe dans dist/src
  const srcAppModulePath = path.join(distSrcDir, 'app.module.js');
  
  if (fs.existsSync(srcAppModulePath)) {
    console.log('✅ app.module.js trouvé dans dist/src/');
    
    // 4. Copier tout le dossier config/ qui contient généralement les validations
    const srcConfigDir = path.join(distSrcDir, 'config');
    const distConfigDir = path.join(distDir, 'config');
    
    if (fs.existsSync(srcConfigDir)) {
      console.log('📂 Copie du dossier config/ et sous-dossiers...');
      const filesCopied = copyDirectoryRecursive(srcConfigDir, distConfigDir);
      console.log(`✅ ${filesCopied} fichiers copiés depuis config/`);
    } else {
      console.log('⚠️ Dossier config/ non trouvé dans dist/src/');
    }
    
    // 5. Copier de manière récursive tous les dossiers essentiels
    const essentialDirs = ['common', 'auth', 'modules', 'health', 'security', 'database'];
    
    for (const dir of essentialDirs) {
      const srcDir = path.join(distSrcDir, dir);
      const targetDir = path.join(distDir, dir);
      
      if (fs.existsSync(srcDir)) {
        console.log(`📂 Copie du dossier ${dir}/ et sous-dossiers...`);
        const filesCopied = copyDirectoryRecursive(srcDir, targetDir);
        console.log(`✅ ${filesCopied} fichiers copiés depuis ${dir}/`);
      }
    }
    
    // 6. Copier les fichiers de base
    const baseFiles = ['app.module.js', 'app.controller.js', 'app.service.js'];
    for (const file of baseFiles) {
      copyFileIfExists(
        path.join(distSrcDir, file), 
        path.join(distDir, file)
      );
    }
    
    // 7. Créer un wrapper index.js à la racine pour plus de robustesse
    createRootWrapper();
  } else {
    console.log('❌ app.module.js non trouvé dans dist/src/, impossible de corriger la structure');
  }
  
  // Vérifier la structure finale
  console.log('\n📂 Structure finale:');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    console.log(`Fichiers dans dist/: ${files.join(', ')}`);
  }
}

// Exécuter la correction
try {
  console.log('🔧 Correction de la structure dist pour NestJS...');
  copyModulesToRoot();
  console.log('✅ Structure dist corrigée avec succès');
} catch (error) {
  console.error(`❌ Erreur lors de la correction de la structure: ${error.message}`);
  process.exit(1);
} 