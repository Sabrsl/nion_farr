/**
 * Script pour analyser les dépendances npm inutilisées
 * 
 * Usage:
 * node scripts/analyze-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chemins des package.json
const PACKAGE_PATHS = [
  './package.json',
  './frontend/package.json',
  './backend/package.json'
];

// Dépendances à conserver même si elles semblent inutilisées
const ESSENTIAL_DEPS = [
  'react',
  'react-dom',
  'next',
  '@nestjs/core',
  '@nestjs/common',
  'rxjs',
  'reflect-metadata',
  'typescript',
  'tslib',
  'axios',
  'tailwindcss'
];

/**
 * Récupère les dépendances depuis un package.json
 */
function getDependencies(packagePath) {
  if (!fs.existsSync(packagePath)) {
    return { dependencies: {}, devDependencies: {} };
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {}
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${packagePath}:`, error.message);
    return { dependencies: {}, devDependencies: {} };
  }
}

/**
 * Exécute depcheck pour trouver les dépendances inutilisées
 */
function getUnusedDependencies(directory) {
  try {
    const result = execSync(`npx depcheck ${directory} --json`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    // depcheck renvoie un code d'erreur si des dépendances sont inutilisées
    try {
      return JSON.parse(error.stdout);
    } catch (parseError) {
      console.error('Erreur lors de l\'analyse des dépendances:', parseError.message);
      return {
        dependencies: [],
        devDependencies: []
      };
    }
  }
}

/**
 * Formate la taille des packages pour l'affichage
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Obtient la taille d'un package dans node_modules
 */
function getPackageSize(packageName) {
  try {
    const packagePath = path.join('node_modules', packageName);
    if (!fs.existsSync(packagePath)) return 'N/A';

    const totalSize = execSync(`du -s ${packagePath}`, { encoding: 'utf8' });
    const sizeInKB = parseInt(totalSize.split('\t')[0]);
    return formatSize(sizeInKB * 1024); // du -s donne la taille en KB
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Fonction principale
 */
function main() {
  console.log('📦 Analyse des dépendances npm inutilisées...\n');

  for (const packagePath of PACKAGE_PATHS) {
    if (!fs.existsSync(packagePath)) {
      console.log(`🟡 ${packagePath} non trouvé, ignoré.`);
      continue;
    }

    console.log(`🔍 Analyse de ${packagePath}...`);
    
    // Obtenir les dépendances depuis package.json
    const { dependencies, devDependencies } = getDependencies(packagePath);
    
    // Répertoire parent du package.json
    const directory = path.dirname(packagePath);
    
    // Exécuter depcheck pour trouver les dépendances inutilisées
    const { dependencies: unusedDeps, devDependencies: unusedDevDeps } = getUnusedDependencies(directory);
    
    // Filtrer les dépendances essentielles
    const filteredUnusedDeps = unusedDeps.filter(dep => !ESSENTIAL_DEPS.includes(dep));
    const filteredUnusedDevDeps = unusedDevDeps.filter(dep => !ESSENTIAL_DEPS.includes(dep));
    
    // Afficher les dépendances inutilisées (production)
    if (filteredUnusedDeps.length > 0) {
      console.log('\n🔴 Dépendances de production inutilisées:');
      console.log('─────────────────────────────────────────');
      
      for (const dep of filteredUnusedDeps) {
        const version = dependencies[dep] || 'unknown';
        const size = getPackageSize(dep);
        console.log(`• ${dep} (${version}) - ${size}`);
      }
    } else {
      console.log('\n✅ Aucune dépendance de production inutilisée trouvée.');
    }
    
    // Afficher les dépendances inutilisées (développement)
    if (filteredUnusedDevDeps.length > 0) {
      console.log('\n🟠 Dépendances de développement inutilisées:');
      console.log('─────────────────────────────────────────────');
      
      for (const dep of filteredUnusedDevDeps) {
        const version = devDependencies[dep] || 'unknown';
        const size = getPackageSize(dep);
        console.log(`• ${dep} (${version}) - ${size}`);
      }
    } else {
      console.log('\n✅ Aucune dépendance de développement inutilisée trouvée.');
    }
    
    // Recommandations
    if (filteredUnusedDeps.length > 0 || filteredUnusedDevDeps.length > 0) {
      console.log('\n💡 Recommandations:');
      console.log('─────────────────────');
      
      if (filteredUnusedDeps.length > 0) {
        const depsToRemove = filteredUnusedDeps.join(' ');
        console.log(`npm uninstall ${depsToRemove}`);
      }
      
      if (filteredUnusedDevDeps.length > 0) {
        const devDepsToRemove = filteredUnusedDevDeps.join(' ');
        console.log(`npm uninstall --save-dev ${devDepsToRemove}`);
      }
    }
    
    console.log('\n───────────────────────────────────────────────────────\n');
  }
  
  console.log('📋 Analyse terminée. Vérifiez bien l\'impact avant de supprimer des dépendances.');
}

// Exécuter le script
main(); 