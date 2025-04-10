/**
 * Script pour nettoyer les fichiers .js qui ont un équivalent .ts dans le répertoire source
 * Utile pour éviter les conflits pendant le build
 */

const fs = require('fs');
const path = require('path');

// Fonction pour trouver récursivement tous les fichiers .js et .ts
function findJsAndTsFiles(dir, jsFiles = [], tsFiles = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('dist')) {
      findJsAndTsFiles(filePath, jsFiles, tsFiles);
    } else {
      if (file.endsWith('.js') && !file.endsWith('.config.js') && !file.endsWith('-copy.js') && file !== 'check-dist.js' && file !== 'direct-copy.js') {
        jsFiles.push(filePath);
      } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        tsFiles.push(filePath);
      }
    }
  }

  return { jsFiles, tsFiles };
}

// Fonction principale de nettoyage
function cleanSourceJs() {
  console.log('🧹 Nettoyage des fichiers .js ayant un équivalent .ts dans le répertoire source...');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const { jsFiles, tsFiles } = findJsAndTsFiles(srcDir);
  
  console.log(`📊 Trouvé ${jsFiles.length} fichiers .js et ${tsFiles.length} fichiers .ts`);
  
  // Liste des fichiers spéciaux à ne jamais supprimer
  const safeFiles = [
    'direct-copy.js',
    'check-dist.js'
  ];
  
  // Créer un mapping des fichiers TS vers leur équivalent JS potentiel
  const tsMappings = {};
  
  // Pour chaque fichier TS, créer un mapping vers son équivalent JS
  tsFiles.forEach(tsFile => {
    const tsBasename = path.basename(tsFile, '.ts');
    const tsDir = path.dirname(tsFile);
    const potentialJsFile = path.join(tsDir, `${tsBasename}.js`);
    tsMappings[potentialJsFile] = tsFile;
  });
  
  // Trouver les fichiers .js qui ont un équivalent .ts
  const duplicateJsFiles = jsFiles.filter(jsFile => {
    // Vérifier si ce fichier JS a un TS correspondant
    return tsMappings[jsFile] !== undefined;
  });
  
  console.log(`🔍 Trouvé ${duplicateJsFiles.length} fichiers .js ayant un équivalent .ts`);
  
  if (duplicateJsFiles.length === 0) {
    // Vérification supplémentaire avec noms de base
    console.log('🔍 Recherche supplémentaire par nom de fichier...');
    
    const tsBaseNames = tsFiles.map(f => path.basename(f, '.ts'));
    
    const duplicatesByName = jsFiles.filter(jsFile => {
      const jsBaseName = path.basename(jsFile, '.js');
      // Ne pas supprimer les fichiers de sécurité
      const fileName = path.basename(jsFile);
      if (safeFiles.includes(fileName)) {
        return false;
      }
      return tsBaseNames.includes(jsBaseName);
    });
    
    console.log(`🔍 Trouvé ${duplicatesByName.length} fichiers .js par correspondance de nom`);
    
    // Supprimer les fichiers dupliqués
    let deletedCount = 0;
    let skippedCount = 0;
    
    for (const jsFile of duplicatesByName) {
      const fileName = path.basename(jsFile);
      
      if (safeFiles.includes(fileName)) {
        console.log(`⚠️ Conservé (fichier spécial): ${path.relative(srcDir, jsFile)}`);
        skippedCount++;
        continue;
      }
      
      try {
        fs.unlinkSync(jsFile);
        console.log(`🗑️ Supprimé: ${path.relative(srcDir, jsFile)}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de ${jsFile}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Nettoyage terminé: ${deletedCount} fichiers supprimés, ${skippedCount} fichiers conservés.`);
    
    return;
  }
  
  // Supprimer les fichiers .js dupliqués, sauf ceux de la liste de sécurité
  let deletedCount = 0;
  let skippedCount = 0;
  
  for (const jsFile of duplicateJsFiles) {
    const fileName = path.basename(jsFile);
    
    if (safeFiles.includes(fileName)) {
      console.log(`⚠️ Conservé (fichier spécial): ${path.relative(srcDir, jsFile)}`);
      skippedCount++;
      continue;
    }
    
    try {
      fs.unlinkSync(jsFile);
      console.log(`🗑️ Supprimé: ${path.relative(srcDir, jsFile)}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de ${jsFile}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Nettoyage terminé: ${deletedCount} fichiers supprimés, ${skippedCount} fichiers conservés.`);
  console.log('🚀 Vous pouvez maintenant exécuter "npm run build:railway" pour un build propre.');
}

// Exécuter la fonction principale
cleanSourceJs(); 