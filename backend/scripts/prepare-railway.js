#!/usr/bin/env node

/**
 * Script de préparation du déploiement vers Railway
 * Ce script vérifie si toutes les conditions sont remplies pour migrer vers Railway
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚂 Préparation de la migration vers Railway...');

// Vérification des fichiers essentiels
const essentialFiles = ['dist/main.js', '.env.railway', 'railway.toml'];
const missingFiles = [];

essentialFiles.forEach(file => {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Fichiers manquants:', missingFiles.join(', '));
  console.log('Veuillez exécuter "npm run build" pour générer le dossier dist');
  process.exit(1);
}

// Vérification du fichier .env.railway
const envRailway = fs.readFileSync(path.join(process.cwd(), '.env.railway'), 'utf8');
const placeholders = [
  'MONGODB_URI_PLACEHOLDER',
  'JWT_SECRET_PLACEHOLDER',
  'JWT_REFRESH_SECRET_PLACEHOLDER'
];

const missingEnvVars = [];
placeholders.forEach(placeholder => {
  if (envRailway.includes(placeholder)) {
    missingEnvVars.push(placeholder.replace('_PLACEHOLDER', ''));
  }
});

if (missingEnvVars.length > 0) {
  console.error('❌ Variables d\'environnement à configurer dans .env.railway:', missingEnvVars.join(', '));
  console.log('Veuillez remplacer les placeholders par les valeurs réelles avant de déployer');
}

// Vérification de la taille du dossier dist
try {
  const distSizeBytes = getFolderSize(path.join(process.cwd(), 'dist'));
  const distSizeMB = (distSizeBytes / (1024 * 1024)).toFixed(2);
  console.log(`📦 Taille du dossier dist: ${distSizeMB} MB`);
  
  if (distSizeBytes > 500 * 1024 * 1024) {
    console.warn('⚠️ Le dossier dist est très volumineux. Railway peut avoir des limitations.');
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification de la taille du dossier dist:', error.message);
}

// Conseils pour la migration
console.log('\n📋 Liste des étapes pour la migration vers Railway:');
console.log('1. Assurez-vous que toutes les variables d\'environnement sont configurées dans .env.railway');
console.log('2. Créez un nouveau projet sur Railway avec l\'option "Deploy from GitHub"');
console.log('3. Liez votre repository GitHub au projet Railway');
console.log('4. Configurez les variables d\'environnement dans Railway (utilisez les valeurs de Render)');
console.log('5. Déclenchez un déploiement manuel ou poussez un commit');
console.log('6. Une fois le déploiement réussi, vérifiez que tout fonctionne correctement');
console.log('7. Si tout est OK, mettez Render en pause (ne le supprimez pas tout de suite)');

// Affiche le statut du déploiement Render actuel
console.log('\n🔍 Statut du projet Render actuel:');
console.log('Pour sauvegarder vos variables d\'environnement Render, exécutez:');
console.log('railway env export > render-env-backup.txt');

// Aide pour générer de nouveaux secrets JWT si nécessaire
console.log('\n🔑 Pour générer de nouveaux secrets JWT, exécutez:');
console.log('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');

console.log('\n✅ Préparation terminée!');

// Fonction pour calculer la taille d'un dossier
function getFolderSize(folderPath) {
  let totalSize = 0;
  
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
} 