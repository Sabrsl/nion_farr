/**
 * Script de nettoyage des fichiers stubs
 * Ce script supprime proprement les fichiers stubs générés précédemment
 * qui ne sont plus nécessaires avec l'approche professionnelle
 */
const fs = require('fs');
const path = require('path');

// Liste des fichiers stubs connus qui peuvent être supprimés
const STUB_FILES = [
  // Fichiers stubs mongoose
  'dist/node_modules/@nestjs/mongoose/dist/decorators/prop.decorator.js',
  'dist/node_modules/@nestjs/mongoose/dist/decorators/schema.decorator.js',
  
  // Fichiers stubs des modules
  'dist/scripts/sync-control.js',
  
  // Anciennes versions de secours
  'server-simple.js',
  'minimal-server.js'
];

// Fonction pour supprimer un fichier s'il existe
function removeFileIfExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Fichier stub supprimé: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de ${filePath}: ${error.message}`);
      return false;
    }
  } else {
    console.log(`ℹ️ Fichier stub déjà absent: ${filePath}`);
    return false;
  }
}

// Fonction principale
function cleanupStubs() {
  console.log('🧹 Nettoyage des fichiers stubs...');
  
  let removedCount = 0;
  
  // Supprimer chaque fichier stub
  for (const file of STUB_FILES) {
    if (removeFileIfExists(file)) {
      removedCount++;
    }
  }
  
  console.log(`✅ Nettoyage terminé: ${removedCount} fichiers stubs supprimés`);
}

// Exécuter le script
cleanupStubs(); 