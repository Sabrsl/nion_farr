/**
 * Script de vérification post-build
 * Vérifie que le dossier dist et le fichier main.js ont été correctement générés
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Vérification des fichiers du build...');

// Vérifier que le dossier dist existe
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ ERREUR: Le dossier dist/ n\'existe pas!');
  
  // Tenter de reconstruire
  console.log('⚠️ Tentative de reconstruction du build...');
  try {
    execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });
    console.log('✅ Rebuild effectué. Vérification...');
  } catch (err) {
    console.error('❌ Échec du rebuild:', err.message);
    process.exit(1);
  }
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ ERREUR: Le dossier dist/ n\'existe toujours pas après rebuild!');
    process.exit(1);
  }
}

// Vérifier que main.js existe
const mainJsPath = path.join(distPath, 'main.js');
if (!fs.existsSync(mainJsPath)) {
  console.error('❌ ERREUR: Le fichier main.js n\'existe pas!');
  console.log('📂 Contenu du dossier dist/:');
  fs.readdirSync(distPath).forEach(file => {
    console.log(`- ${file}`);
  });
  
  // Tenter de compiler spécifiquement main.ts
  console.log('⚠️ Tentative de compilation spécifique de main.ts...');
  try {
    execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });
    console.log('✅ Compilation effectuée. Vérification...');
  } catch (err) {
    console.error('❌ Échec de la compilation:', err.message);
    process.exit(1);
  }
  
  if (!fs.existsSync(mainJsPath)) {
    console.error('❌ ERREUR: Le fichier main.js n\'existe toujours pas après compilation spécifique!');
    process.exit(1);
  }
}

// Vérifier la taille de main.js
const stats = fs.statSync(mainJsPath);
console.log(`📊 Taille du fichier main.js: ${stats.size} octets`);

if (stats.size < 5000) {
  console.warn('⚠️ ATTENTION: Le fichier main.js est trop petit, il pourrait être incomplet!');
  // Lire et afficher les premières lignes du fichier
  const content = fs.readFileSync(mainJsPath, 'utf8');
  console.log('📄 Premières lignes de main.js:');
  console.log(content.substring(0, 200) + '...');
} else {
  console.log('✅ Le fichier main.js a une taille correcte.');
}

// Vérifier si le dossier src existe dans dist
const distSrcPath = path.join(distPath, 'src');
if (fs.existsSync(distSrcPath)) {
  console.log('✅ Le dossier dist/src existe.');
  
  // Lister les principaux fichiers/dossiers dans dist/src
  console.log('📂 Contenu principal de dist/src/:');
  fs.readdirSync(distSrcPath).slice(0, 5).forEach(file => {
    console.log(`- ${file}`);
  });
  
  if (fs.readdirSync(distSrcPath).length > 5) {
    console.log(`... et ${fs.readdirSync(distSrcPath).length - 5} autres fichiers/dossiers`);
  }
} else {
  console.warn('⚠️ ATTENTION: Le dossier dist/src n\'existe pas!');
}

console.log('✅ Vérification des fichiers du build terminée.');