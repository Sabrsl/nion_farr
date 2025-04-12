// Script de correction des problèmes de build Vercel
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Exécution du script de diagnostic et correction pour Vercel...');

// Vérifier l'environnement
console.log('🔍 Vérification de l\'environnement...');
const isVercel = process.env.VERCEL === '1';
console.log(`Environnement Vercel: ${isVercel ? 'Oui' : 'Non'}`);

// Chemin des fichiers à vérifier
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const envProdPath = path.join(process.cwd(), '.env.production');

// Vérifier si les fichiers existent
console.log('🔍 Vérification des fichiers critiques...');
const filesExist = {
  nextConfig: fs.existsSync(nextConfigPath),
  vercelJson: fs.existsSync(vercelJsonPath),
  packageJson: fs.existsSync(packageJsonPath),
  envProd: fs.existsSync(envProdPath)
};

console.log(`next.config.js: ${filesExist.nextConfig ? '✅' : '❌'}`);
console.log(`vercel.json: ${filesExist.vercelJson ? '✅' : '❌'}`);
console.log(`package.json: ${filesExist.packageJson ? '✅' : '❌'}`);
console.log(`.env.production: ${filesExist.envProd ? '✅' : '❌'}`);

// Vérifier le script de build dans package.json
if (filesExist.packageJson) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
  const hasVercelBuildScript = packageJson.scripts && packageJson.scripts['vercel-build'];
  
  console.log(`Script build: ${hasBuildScript ? '✅' : '❌'}`);
  console.log(`Script vercel-build: ${hasVercelBuildScript ? '✅' : '❌'}`);
  
  // Ajouter le script vercel-build s'il n'existe pas
  if (!hasVercelBuildScript && hasBuildScript) {
    console.log('🔧 Ajout du script vercel-build au package.json...');
    packageJson.scripts['vercel-build'] = packageJson.scripts.build;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Script vercel-build ajouté');
  }
}

// Vérifier la configuration Vercel
if (filesExist.vercelJson) {
  try {
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    console.log('📋 Configuration Vercel:');
    console.log(`- Framework: ${vercelJson.framework || 'Non spécifié'}`);
    console.log(`- Build Command: ${vercelJson.buildCommand || 'Non spécifié'}`);
    console.log(`- Output Directory: ${vercelJson.outputDirectory || 'Non spécifié'}`);
    
    // Vérifier les erreurs dans la syntaxe des redirections
    if (vercelJson.rewrites) {
      let hasErrors = false;
      vercelJson.rewrites.forEach((rewrite, index) => {
        if (rewrite.dest && !rewrite.destination) {
          console.log(`⚠️ Erreur détectée dans les redirections [${index}]: 'dest' devrait être 'destination'`);
          vercelJson.rewrites[index].destination = rewrite.dest;
          delete vercelJson.rewrites[index].dest;
          hasErrors = true;
        }
        
        // Corriger les patterns de chemin
        if (rewrite.destination && rewrite.destination.includes('$1') && !rewrite.destination.includes(':path')) {
          console.log(`⚠️ Erreur détectée dans les redirections [${index}]: '$1' devrait être ':path*'`);
          vercelJson.rewrites[index].destination = rewrite.destination.replace('$1', ':path*');
          hasErrors = true;
        }
      });
      
      if (hasErrors) {
        console.log('🔧 Correction des erreurs dans vercel.json...');
        fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, 2));
        console.log('✅ Corrections appliquées à vercel.json');
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la lecture/écriture de vercel.json:', error);
  }
}

// Vérifier next.config.js pour les configurations incompatibles
if (filesExist.nextConfig) {
  try {
    let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Vérifier les paramètres expérimentaux
    console.log('🔍 Vérification des paramètres expérimentaux dans next.config.js...');
    
    // Vérifier si les ESM externals sont configurés correctement
    if (nextConfigContent.includes('esmExternals')) {
      console.log('⚠️ Configuration esmExternals détectée');
    }
    
    // Vérifier si le mode output est 'standalone' 
    if (nextConfigContent.includes("output: 'standalone'") || nextConfigContent.includes('output: "standalone"')) {
      console.log('✅ Mode output: standalone détecté');
    }
    
    // Vérifier la configuration des rewrites
    if (nextConfigContent.includes('async rewrites()')) {
      console.log('✅ Configuration des redirections détectée dans next.config.js');
    }
    
    // Vérifier la configuration des variables d'environnement
    console.log('🔍 Vérification des variables d\'environnement dans next.config.js...');
    const envRegex = /env:\s*{[^}]*}/;
    const envMatch = nextConfigContent.match(envRegex);
    if (envMatch) {
      console.log('✅ Configuration env détectée dans next.config.js');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la lecture de next.config.js:', error);
  }
}

// Vérifier les variables d'environnement
if (filesExist.envProd) {
  try {
    const envContent = fs.readFileSync(envProdPath, 'utf8');
    console.log('📋 Variables d\'environnement critiques:');
    
    // Vérifier les variables essentielles
    const essentialVars = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_ENVIRONMENT'
    ];
    
    essentialVars.forEach(varName => {
      const hasVar = envContent.includes(`${varName}=`);
      console.log(`- ${varName}: ${hasVar ? '✅' : '❌'}`);
      
      // Si la variable est manquante, essayer de la récupérer depuis process.env
      if (!hasVar) {
        const varValue = process.env[varName];
        if (varValue) {
          console.log(`🔧 Ajout de ${varName} dans .env.production...`);
          fs.appendFileSync(envProdPath, `\n${varName}=${varValue}`);
          console.log(`✅ Variable ${varName} ajoutée`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la lecture/écriture de .env.production:', error);
  }
}

// Vérifier les modules Next.js
console.log('🔍 Vérification des modules Next.js...');
try {
  // Vérifier si next/font est importé (peut causer des problèmes sur Vercel)
  const hasNextFont = execSync('grep -r "next/font" --include="*.js" --include="*.tsx" --include="*.ts" . || true', { encoding: 'utf8' });
  
  if (hasNextFont && hasNextFont.trim() !== '') {
    console.log('⚠️ Utilisation de next/font détectée, cela peut causer des problèmes sur Vercel');
  } else {
    console.log('✅ Pas d\'utilisation de next/font détectée');
  }
  
} catch (error) {
  console.log('⚠️ Impossible d\'exécuter la commande grep pour vérifier les imports.');
}

// Créer un fichier de rapport
const reportContent = `# Rapport de diagnostic pour Vercel
Date: ${new Date().toISOString()}

## Fichiers critiques
- next.config.js: ${filesExist.nextConfig ? '✅' : '❌'}
- vercel.json: ${filesExist.vercelJson ? '✅' : '❌'}
- package.json: ${filesExist.packageJson ? '✅' : '❌'}
- .env.production: ${filesExist.envProd ? '✅' : '❌'}

## Statut
Script de diagnostic terminé. Vérifiez les logs pour plus de détails.
`;

fs.writeFileSync('vercel-diagnostic-report.md', reportContent);
console.log('📝 Rapport de diagnostic enregistré dans vercel-diagnostic-report.md');

console.log('✅ Script de diagnostic et correction terminé'); 