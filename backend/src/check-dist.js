const fs = require('fs');
const path = require('path');

console.log('===== VÉRIFICATION DU RÉPERTOIRE DIST =====');

// Afficher le répertoire courant
const currentDir = process.cwd();
console.log(`Répertoire courant: ${currentDir}`);

// Vérifier si le répertoire dist existe
const distDir = path.join(currentDir, 'dist');
const distExists = fs.existsSync(distDir);
console.log(`Le répertoire dist existe: ${distExists}`);

if (distExists) {
  // Lister les fichiers dans le répertoire dist
  console.log('Contenu du répertoire dist:');
  const distFiles = fs.readdirSync(distDir);
  distFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${stats.isDirectory() ? 'répertoire' : 'fichier'}, ${stats.size} octets)`);
  });

  // Vérifier si main.js existe
  const mainJsPath = path.join(distDir, 'main.js');
  const mainJsExists = fs.existsSync(mainJsPath);
  console.log(`Le fichier main.js existe: ${mainJsExists}`);

  if (mainJsExists) {
    const mainJsStats = fs.statSync(mainJsPath);
    console.log(`Taille de main.js: ${mainJsStats.size} octets`);
    console.log(`Permissions: ${mainJsStats.mode.toString(8)}`);
  }
} else {
  console.log('Contenu du répertoire racine:');
  const rootFiles = fs.readdirSync(currentDir);
  rootFiles.forEach(file => {
    const filePath = path.join(currentDir, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${stats.isDirectory() ? 'répertoire' : 'fichier'}, ${stats.size} octets)`);
  });
}

// Vérifier package.json
const packageJsonPath = path.join(currentDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('\n===== VÉRIFICATION DE PACKAGE.JSON =====');
  const packageJson = require(packageJsonPath);
  console.log(`Nom: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
  console.log(`Scripts de build: ${packageJson.scripts.build}`);
  console.log(`Scripts de start: ${packageJson.scripts.start}`);
}

// Vérifier tsconfig.json
const tsconfigPath = path.join(currentDir, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('\n===== VÉRIFICATION DE TSCONFIG.JSON =====');
  const tsconfig = require(tsconfigPath);
  console.log(`outDir: ${tsconfig.compilerOptions.outDir}`);
  console.log(`baseUrl: ${tsconfig.compilerOptions.baseUrl}`);
  console.log(`include: ${JSON.stringify(tsconfig.include)}`);
  console.log(`exclude: ${JSON.stringify(tsconfig.exclude)}`);
}

// Vérifier nest-cli.json
const nestCliPath = path.join(currentDir, 'nest-cli.json');
if (fs.existsSync(nestCliPath)) {
  console.log('\n===== VÉRIFICATION DE NEST-CLI.JSON =====');
  const nestCli = require(nestCliPath);
  console.log(`sourceRoot: ${nestCli.sourceRoot}`);
  console.log(`compilerOptions: ${JSON.stringify(nestCli.compilerOptions)}`);
} 