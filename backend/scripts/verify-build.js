/**
 * Ce script vérifie que le build a correctement généré un fichier main.js valide
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}=== Vérification du build pour Railway ===${colors.reset}`);

// Vérifier l'existence du dossier dist
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.log(`${colors.red}✗ Le dossier dist/ n'existe pas!${colors.reset}`);
  process.exit(1);
}

// Lister les fichiers dans le dossier dist
console.log(`${colors.blue}Contenu du dossier dist/:${colors.reset}`);
const distFiles = fs.readdirSync(distPath);
distFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  console.log(`- ${file} (${stats.size} octets)`);
});

// Vérifier l'existence de main.js
const mainJsPath = path.join(distPath, 'main.js');
if (!fs.existsSync(mainJsPath)) {
  console.log(`${colors.red}✗ Le fichier main.js n'existe pas!${colors.reset}`);
  console.log(`${colors.yellow}Contenu de dist/ :${colors.reset}`);
  console.log(distFiles.join(', '));
  process.exit(1);
}

// Vérifier la taille de main.js
const stats = fs.statSync(mainJsPath);
console.log(`${colors.blue}Taille de main.js: ${stats.size} octets${colors.reset}`);

if (stats.size < 5000) {
  console.log(`${colors.red}✗ Le fichier main.js est trop petit (${stats.size} octets)!${colors.reset}`);
  console.log(`${colors.yellow}Attention: Un fichier main.js valide devrait faire plusieurs KB.${colors.reset}`);
  
  // Lire et afficher le contenu de main.js
  console.log(`${colors.yellow}Contenu de main.js:${colors.reset}`);
  const content = fs.readFileSync(mainJsPath, 'utf8');
  console.log(content.substring(0, 500) + '...');
  
  // Créer un fichier main.js.backup
  fs.writeFileSync(mainJsPath + '.invalid', content);
  console.log(`${colors.yellow}Fichier main.js.invalid créé pour analyse ultérieure${colors.reset}`);
  
  process.exit(1);
} else {
  console.log(`${colors.green}✓ La taille de main.js semble correcte (${stats.size} octets)${colors.reset}`);
  
  // Vérifier que le contenu semble correct
  const content = fs.readFileSync(mainJsPath, 'utf8');
  
  // Vérifier si le fichier contient des mots-clés typiques d'une application NestJS
  const containsNestKeywords = content.includes('NestFactory') || 
                              content.includes('createApplicationContext') || 
                              content.includes('bootstrap');
                              
  if (containsNestKeywords) {
    console.log(`${colors.green}✓ Le contenu de main.js semble être celui d'une application NestJS${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Le contenu de main.js ne contient pas les mots-clés attendus d'une application NestJS${colors.reset}`);
    console.log(`${colors.yellow}Premières lignes du fichier:${colors.reset}`);
    console.log(content.substring(0, 500) + '...');
  }
}

console.log(`${colors.green}✓ Vérification du build terminée${colors.reset}`); 