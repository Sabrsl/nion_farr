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

function fixMainJsImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si les imports sont relatifs et incorrects
    if (content.includes('require("./app.module")') || content.includes('require(\'./app.module\')')) {
      // Corriger le chemin d'importation
      content = content.replace(
        /require\(['"]\.\/app\.module['"]\)/g, 
        'require("./src/app.module")'
      );
      
      // Écrire le fichier modifié
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
  }
  
  // 2. Corriger les chemins d'importation dans main.js
  if (fs.existsSync(mainJsInRoot)) {
    fixMainJsImports(mainJsInRoot);
  }
  
  // 3. Copier app.module.js et autres modules essentiels
  const srcAppModulePath = path.join(distSrcDir, 'app.module.js');
  
  if (fs.existsSync(srcAppModulePath)) {
    // Copier app.module.js à côté de main.js à la racine de dist
    copyFileIfExists(srcAppModulePath, path.join(distDir, 'app.module.js'));
    
    // Copier également app.controller.js et app.service.js
    copyFileIfExists(
      path.join(distSrcDir, 'app.controller.js'), 
      path.join(distDir, 'app.controller.js')
    );
    
    copyFileIfExists(
      path.join(distSrcDir, 'app.service.js'), 
      path.join(distDir, 'app.service.js')
    );
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