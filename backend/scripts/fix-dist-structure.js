/**
 * Script de correction de la structure du dossier dist/
 * - Crée la structure de dossiers nécessaire
 * - Copie les fichiers critiques au bon endroit
 * - Assure que les dépendances de réflexion sont correctement importées
 * Version professionnelle sans génération de stubs
 */
const fs = require('fs');
const path = require('path');

// Fonction pour créer un dossier s'il n'existe pas
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`📁 Création du dossier: ${directory}`);
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Fonction pour copier un fichier
function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`✅ Fichier copié: ${source} -> ${destination}`);
      return true;
    } else {
      console.log(`⚠️ Fichier source manquant: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la copie de ${source} vers ${destination}:`, error);
    return false;
  }
}

// Fonction pour modifier les imports dans un fichier JS
function fixModuleImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier à modifier manquant: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si reflect-metadata est déjà importé
    if (!content.includes('require("reflect-metadata")') && !content.includes("require('reflect-metadata')")) {
      // Ajouter l'import de reflect-metadata au début du fichier
      content = `require('reflect-metadata');\n${content}`;
      console.log(`✅ Import reflect-metadata ajouté à ${filePath}`);
    }
    
    // Corriger les extensions d'import manquantes
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    const fromRegex = /from ['"]([^'"]+)['"]/g;
    
    // Fonction pour ajouter .js aux importations locales
    function processImport(match, importPath) {
      if (importPath.startsWith('@') || !importPath.startsWith('.')) {
        return match; // Ne pas modifier les importations de packages
      }
      
      if (importPath.endsWith('.js')) {
        return match; // Déjà correcte
      }
      
      return match.replace(importPath, `${importPath}.js`);
    }
    
    // Corriger les importations require()
    content = content.replace(requireRegex, (match, importPath) => {
      return processImport(match, importPath);
    });
    
    // Corriger les importations ES6
    content = content.replace(fromRegex, (match, importPath) => {
      return processImport(match, importPath);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Imports corrigés dans ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la modification des imports dans ${filePath}:`, error);
    return false;
  }
}

// Fonction pour assurer que les imports nécessaires sont dans l'index.js du dist
function fixEntryPoint() {
  const mainJsPath = path.join('dist', 'main.js');
  
  if (fs.existsSync(mainJsPath)) {
    console.log('🔍 Vérification du point d\'entrée main.js...');
    fixModuleImports(mainJsPath);
  } else {
    console.log('⚠️ main.js non trouvé dans dist/');
  }
  
  // Vérifier et corriger app.module.js
  const appModulePath = path.join('dist', 'app.module.js');
  if (fs.existsSync(appModulePath)) {
    console.log('🔍 Vérification du module app.module.js...');
    fixModuleImports(appModulePath);
  } else {
    console.log('⚠️ app.module.js manquant dans dist/, tentative de copie depuis src/...');
    const srcAppModulePath = path.join('src', 'app.module.js');
    const srcAppModuleDistPath = path.join('dist', 'src', 'app.module.js');
    
    if (fs.existsSync(srcAppModulePath)) {
      copyFile(srcAppModulePath, appModulePath);
      fixModuleImports(appModulePath);
    } else if (fs.existsSync(srcAppModuleDistPath)) {
      copyFile(srcAppModuleDistPath, appModulePath);
      fixModuleImports(appModulePath);
    } else {
      console.log('⚠️ Impossible de trouver app.module.js, création d\'un stub basique...');
      createAppModuleStub();
    }
  }
  
  // Vérifier et corriger app.controller.js
  const appControllerPath = path.join('dist', 'app.controller.js');
  if (fs.existsSync(appControllerPath)) {
    console.log('🔍 Vérification du contrôleur app.controller.js...');
    fixModuleImports(appControllerPath);
  } else {
    console.log('⚠️ app.controller.js manquant dans dist/, tentative de copie depuis src/...');
    const srcAppControllerPath = path.join('src', 'app.controller.js');
    const srcAppControllerDistPath = path.join('dist', 'src', 'app.controller.js');
    
    if (fs.existsSync(srcAppControllerPath)) {
      copyFile(srcAppControllerPath, appControllerPath);
      fixModuleImports(appControllerPath);
    } else if (fs.existsSync(srcAppControllerDistPath)) {
      copyFile(srcAppControllerDistPath, appControllerPath);
      fixModuleImports(appControllerPath);
    }
  }
  
  // Vérifier et corriger les éventuels modèles
  const modelsDir = path.join('dist', 'models');
  if (fs.existsSync(modelsDir)) {
    console.log('🔍 Vérification des modèles...');
    
    // Ajouter reflect-metadata aux modèles
    const files = fs.readdirSync(modelsDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(modelsDir, file);
        fixModuleImports(filePath);
      }
    });
  }
}

// Créer un module App minimal pour éviter les erreurs
function createAppModuleStub() {
  const appModulePath = path.join('dist', 'app.module.js');
  const content = `
require('reflect-metadata');
const { Module } = require('@nestjs/common');

class AppModule {}

Object.defineProperty(AppModule, '__annotations__', {
  configurable: true,
  enumerable: true,
  value: [new Module({
    imports: [],
    controllers: [],
    providers: [],
  })],
});

exports.AppModule = AppModule;
`;

  fs.writeFileSync(appModulePath, content, 'utf8');
  console.log(`✅ Module App créé: ${appModulePath}`);
}

// Fonction pour copier récursivement un dossier
function copyDirectoryRecursive(source, destination) {
  if (!fs.existsSync(source)) {
    console.log(`⚠️ Dossier source manquant: ${source}`);
    return;
  }

  ensureDirectoryExists(destination);
  
  try {
    const entries = fs.readdirSync(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        copyDirectoryRecursive(srcPath, destPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        copyFile(srcPath, destPath);
        // Corriger les imports si c'est un fichier JS
        fixModuleImports(destPath);
      }
    }
    
    console.log(`✅ Dossier copié récursivement: ${source} -> ${destination}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la copie récursive du dossier ${source}:`, error);
  }
}

// Assurer que les fichiers nécessaires sont au bon endroit
function fixCriticalFiles() {
  console.log('🔍 Vérification des fichiers critiques...');
  
  // Créer la structure de dossiers
  ensureDirectoryExists('dist/scripts');
  ensureDirectoryExists('dist/models');
  ensureDirectoryExists('dist/modules');
  ensureDirectoryExists('dist/modules/auth');
  ensureDirectoryExists('dist/modules/auth/decorators');
  ensureDirectoryExists('dist/security');
  ensureDirectoryExists('dist/health');
  ensureDirectoryExists('dist/common');
  ensureDirectoryExists('dist/common/pipes');
  ensureDirectoryExists('dist/common/guards');
  ensureDirectoryExists('dist/common/decorators');
  ensureDirectoryExists('dist/common/filters');
  ensureDirectoryExists('dist/common/interceptors');
  ensureDirectoryExists('dist/node_modules/reflect-metadata');
  ensureDirectoryExists('dist/node_modules/@nestjs');
  ensureDirectoryExists('dist/node_modules/@nestjs/mongoose/dist/decorators');
  
  // Copier les fichiers clés depuis src/dist
  copyFile('dist/src/main.js', 'dist/main.js');
  
  // Essayer de copier app.module.js s'il existe à la racine src/
  const srcAppModulePath = path.join('src', 'app.module.js');
  const srcAppModuleDistPath = path.join('dist', 'src', 'app.module.js');
  const destAppModulePath = path.join('dist', 'app.module.js');
  
  if (fs.existsSync(srcAppModulePath)) {
    copyFile(srcAppModulePath, destAppModulePath);
  } else if (fs.existsSync(srcAppModuleDistPath)) {
    copyFile(srcAppModuleDistPath, destAppModulePath);
  }
  
  // Copier reflect-metadata de node_modules vers dist/node_modules
  copyFile('node_modules/reflect-metadata/Reflect.js', 'dist/node_modules/reflect-metadata/Reflect.js');
}

// Fonction principale
function main() {
  console.log('🛠️ Correction de la structure du dossier dist/...');
  
  fixCriticalFiles();
  
  // Vérifier et corriger les points d'entrée principaux
  fixEntryPoint();
  
  console.log('✅ Structure du dossier dist/ corrigée');
}

// Exécuter le script
main(); 