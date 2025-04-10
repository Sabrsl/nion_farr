/**
 * Script qui vérifie les variables d'environnement de Railway
 * et propose des actions pour désactiver proprement Render
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}=== Vérification de la configuration Railway et désactivation de Render ===${colors.reset}`);

// 1. Vérifier les fichiers de configuration
console.log('\n1. Vérification des fichiers de configuration');

// Vérifier .env.railway
const envRailwayPath = path.join(process.cwd(), '.env.railway');
if (fs.existsSync(envRailwayPath)) {
  console.log(`${colors.green}✓ .env.railway existe${colors.reset}`);
  
  // Lire le fichier .env.railway
  const envContent = fs.readFileSync(envRailwayPath, 'utf8');
  const envLines = envContent.split('\n');
  
  // Vérifier les variables essentielles
  const essentialVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'PORT',
    'RAILWAY_DEPLOYMENT',
    'IS_RENDER'
  ];
  
  const missingVars = [];
  essentialVars.forEach(varName => {
    const varLine = envLines.find(line => line.trim().startsWith(`${varName}=`));
    if (!varLine || varLine.split('=')[1].trim() === '') {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`${colors.red}✗ Variables manquantes ou incomplètes: ${missingVars.join(', ')}${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Toutes les variables essentielles sont présentes${colors.reset}`);
  }
  
  // Vérifier spécifiquement IS_RENDER
  const isRenderLine = envLines.find(line => line.trim().startsWith('IS_RENDER='));
  if (isRenderLine && isRenderLine.includes('true')) {
    console.log(`${colors.red}✗ IS_RENDER est défini à 'true', il devrait être 'false' pour Railway${colors.reset}`);
    console.log(`  Correction: modifier IS_RENDER=true → IS_RENDER=false dans .env.railway`);
  } else if (isRenderLine && isRenderLine.includes('false')) {
    console.log(`${colors.green}✓ IS_RENDER est correctement défini à 'false'${colors.reset}`);
  }
  
  // Vérifier spécifiquement RAILWAY_DEPLOYMENT
  const railwayDeploymentLine = envLines.find(line => line.trim().startsWith('RAILWAY_DEPLOYMENT='));
  if (railwayDeploymentLine && railwayDeploymentLine.includes('false')) {
    console.log(`${colors.red}✗ RAILWAY_DEPLOYMENT est défini à 'false', il devrait être 'true'${colors.reset}`);
    console.log(`  Correction: modifier RAILWAY_DEPLOYMENT=false → RAILWAY_DEPLOYMENT=true dans .env.railway`);
  } else if (railwayDeploymentLine && railwayDeploymentLine.includes('true')) {
    console.log(`${colors.green}✓ RAILWAY_DEPLOYMENT est correctement défini à 'true'${colors.reset}`);
  }
} else {
  console.log(`${colors.red}✗ .env.railway n'existe pas${colors.reset}`);
}

// 2. Vérifier les configurations spécifiques à Render
console.log('\n2. Références à Render à vérifier:');

// Vérifier le fichier environment.ts
const environmentPath = path.join(process.cwd(), 'src/config/environment.ts');
if (fs.existsSync(environmentPath)) {
  const envContent = fs.readFileSync(environmentPath, 'utf8');
  
  if (envContent.includes('isRenderFreeTier') && envContent.includes('isRailwayDeployment')) {
    console.log(`${colors.green}✓ environment.ts contient la détection de Railway${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ environment.ts doit être mis à jour pour détecter Railway${colors.reset}`);
  }
}

// 3. Instructions pour désactiver proprement Render
console.log('\n3. Instructions pour désactiver proprement Render:');
console.log(`${colors.blue}   a) Sauvegardez toutes les variables d'environnement de Render${colors.reset}`);
console.log('      npm run export:render-env');
console.log(`${colors.blue}   b) Mettez en pause le service sur Render (ne le supprimez pas)${colors.reset}`);
console.log('      - Accédez au dashboard Render');
console.log('      - Allez dans "Settings"');
console.log('      - Cliquez sur "Suspend Service"');
console.log(`${colors.blue}   c) Désactivez les déploiements automatiques sur Render${colors.reset}`);
console.log('      - Allez dans "Deploy" > "Settings"');
console.log('      - Désactivez "Auto Deploy"');

// 4. Vérifier le retour en arrière potentiel
console.log('\n4. Instructions en cas de besoin de revenir sur Render:');
console.log(`${colors.blue}   a) Réactivez le service sur Render${colors.reset}`);
console.log('      - Accédez au dashboard Render');
console.log('      - Cliquez sur "Resume Service"');
console.log(`${colors.blue}   b) Restaurez les variables d'environnement${colors.reset}`);
console.log('      - Utilisez le fichier render-env-export.txt généré précédemment');

console.log(`\n${colors.green}✅ Vérification terminée - Suivez les instructions pour une migration réussie${colors.reset}`); 