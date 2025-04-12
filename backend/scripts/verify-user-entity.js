/**
 * Script de vérification de l'entité User
 * Ce script vérifie l'existence et le contenu du fichier user.entity.js
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le dossier dist et le fichier user.entity.js
const distDir = path.join(__dirname, '..', 'dist');
const userEntityPath = path.join(distDir, 'modules', 'users', 'entities', 'user.entity.js');

console.log('🔍 Vérification de l\'entité utilisateur...');

// Vérifier si le dossier dist existe
if (!fs.existsSync(distDir)) {
  console.error('❌ Le dossier dist n\'existe pas!');
  process.exit(1);
}

// Vérifier si le fichier user.entity.js existe
if (!fs.existsSync(userEntityPath)) {
  console.error('❌ Le fichier user.entity.js est manquant!');
  console.log('📋 Dossier entities contenu:');
  
  // Vérifier si le dossier entities existe
  const entitiesDir = path.join(distDir, 'modules', 'users', 'entities');
  if (fs.existsSync(entitiesDir)) {
    const files = fs.readdirSync(entitiesDir);
    console.log(files.length ? files.join('\n') : '(vide)');
  } else {
    console.log('Le dossier entities n\'existe pas');
  }
  
  process.exit(1);
}

// Lire le contenu du fichier pour faire une vérification basique
try {
  const content = fs.readFileSync(userEntityPath, 'utf8');
  
  // Vérifier des éléments essentiels dans le fichier
  const requiredElements = [
    'class User', 
    'UserStatus', 
    'UserRole', 
    '@Entity',
    '@PrimaryGeneratedColumn',
    'username',
    'password',
    'email'
  ];
  
  const missingElements = requiredElements.filter(element => !content.includes(element));
  
  if (missingElements.length > 0) {
    console.error(`❌ Le fichier user.entity.js existe mais il manque des éléments essentiels:`);
    console.error(missingElements.join(', '));
    console.log(`📊 Taille du fichier: ${content.length} caractères`);
    process.exit(1);
  }
  
  console.log('✅ Le fichier user.entity.js existe et semble valide!');
  console.log(`📊 Taille du fichier: ${content.length} caractères`);
  
} catch (error) {
  console.error(`❌ Erreur lors de la lecture du fichier: ${error.message}`);
  process.exit(1);
} 