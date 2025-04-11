/**
 * Script de correction des importations pour le déploiement Railway
 * Ce script corrige uniquement les chemins d'importation sans altérer le code métier
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fonction pour récupérer tous les fichiers JS dans dist
function getJsFiles(directory) {
  return glob.sync(`${directory}/**/*.js`);
}

// Fonction pour ajouter les extensions .js manquantes aux importations
function fixImports(filePath) {
  console.log(`📝 Vérification des importations dans: ${filePath}`);
  
  // Lire le contenu du fichier
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Regex pour identifier les importations sans extension .js
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  const fromRegex = /from ['"]([^'"]+)['"]/g;
  
  // Fonction pour vérifier et corriger les importations
  function processImport(match, importPath) {
    // Ne pas modifier les importations de packages
    if (importPath.startsWith('@') || !importPath.startsWith('.')) {
      return match;
    }
    
    // Ignorer si l'extension .js est déjà présente
    if (importPath.endsWith('.js')) {
      return match;
    }
    
    // Ne pas ajouter d'extension pour les index implicites
    if (importPath.endsWith('/')) {
      return match;
    }
    
    // Ajouter l'extension .js
    const newImportPath = `${importPath}.js`;
    modified = true;
    
    if (match.includes('require')) {
      return match.replace(importPath, newImportPath);
    } else {
      return match.replace(importPath, newImportPath);
    }
  }
  
  // Corriger les importations require()
  content = content.replace(requireRegex, (match, importPath) => {
    return processImport(match, importPath);
  });
  
  // Corriger les importations ES6
  content = content.replace(fromRegex, (match, importPath) => {
    return processImport(match, importPath);
  });
  
  // Enregistrer le fichier si des modifications ont été effectuées
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Importations corrigées dans: ${filePath}`);
  }
}

// Fonction pour assurer que reflect-metadata est importé en premier
function ensureReflectMetadata(filePath) {
  // Vérifier si c'est un module principal ou important
  if (filePath.includes('main.js') || filePath.endsWith('app.module.js')) {
    console.log(`🔍 Vérification de reflect-metadata dans: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si reflect-metadata est déjà importé
    if (!content.includes("require('reflect-metadata')") && !content.includes('require("reflect-metadata")')) {
      // Ajouter l'import au début du fichier
      content = `// Import de reflect-metadata pour assurer le fonctionnement des décorateurs\nrequire('reflect-metadata');\n\n${content}`;
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ reflect-metadata ajouté à: ${filePath}`);
    }
  }
}

// Fonction principale
function main() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.error(`❌ Le répertoire ${distDir} n'existe pas!`);
    return;
  }
  
  console.log('🚀 Correction des importations dans les fichiers JS...');
  
  // Récupérer tous les fichiers JS
  const jsFiles = getJsFiles(distDir);
  console.log(`📊 Trouvé ${jsFiles.length} fichiers JS à vérifier`);
  
  // Traiter chaque fichier
  for (const file of jsFiles) {
    // S'assurer que reflect-metadata est importé en premier
    ensureReflectMetadata(file);
    
    // Corriger les importations
    fixImports(file);
  }
  
  console.log('✅ Terminé! Tous les fichiers ont été vérifiés et corrigés si nécessaire.');
}

// Exécuter le script
main(); 