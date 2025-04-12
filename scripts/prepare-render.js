/**
 * Script de préparation pour le déploiement sur Render
 * Ce script effectue les actions suivantes:
 * 1. Vérifie que l'environnement est correctement configuré
 * 2. Met à jour le package.json si nécessaire
 * 3. Crée les fichiers nécessaires pour Render
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Exécuter une commande et retourner la promesse
const execPromise = (cmd) => {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}Exécution de: ${cmd}${colors.reset}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`${colors.red}Erreur: ${error.message}${colors.reset}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`${colors.yellow}Avertissement: ${stderr}${colors.reset}`);
      }
      if (stdout) {
        console.log(stdout);
      }
      resolve({ stdout, stderr });
    });
  });
};

// Créer un dossier s'il n'existe pas
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`${colors.blue}Création du répertoire: ${dirPath}${colors.reset}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Vérifier si un fichier existe
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Vérifier les variables d'environnement
const checkEnvironment = () => {
  console.log(`${colors.bright}${colors.blue}Vérification de l'environnement pour Render...${colors.reset}`);
  
  // Vérifier si les variables essentielles sont définies
  const requiredVars = ['MONGODB_URI', 'NODE_ENV'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`${colors.yellow}Variables d'environnement manquantes: ${missingVars.join(', ')}${colors.reset}`);
    console.log('Ces variables devront être définies dans le dashboard Render.');
  } else {
    console.log(`${colors.green}✅ Toutes les variables d'environnement requises sont définies${colors.reset}`);
  }
  
  // Définir IS_RENDER si ce n'est pas déjà fait
  if (!process.env.IS_RENDER) {
    process.env.IS_RENDER = 'true';
    console.log(`${colors.green}✅ Variable IS_RENDER définie à 'true'${colors.reset}`);
  }
  
  return true;
};

// Créer ou mettre à jour le fichier Procfile
const createProcfile = () => {
  const procfilePath = path.join(__dirname, '..', 'Procfile');
  const procfileContent = 'web: npm run start:prod';
  
  if (!fileExists(procfilePath)) {
    console.log(`${colors.blue}Création du fichier Procfile...${colors.reset}`);
    fs.writeFileSync(procfilePath, procfileContent);
    console.log(`${colors.green}✅ Fichier Procfile créé${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Fichier Procfile existe déjà${colors.reset}`);
  }
};

// Créer ou mettre à jour le fichier render.yaml
const createRenderYaml = () => {
  const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
  const renderYamlContent = `services:
  - type: web
    name: nionfar-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: APP_URL
        fromService:
          name: nionfar-backend
          type: web
          property: url
      - key: FRONTEND_URL
        value: https://nion-farr.vercel.app
      - key: PORT
        value: 3001
      - key: IS_RENDER
        value: true
    autoDeploy: true
    plan: free
`;
  
  if (!fileExists(renderYamlPath)) {
    console.log(`${colors.blue}Création du fichier render.yaml...${colors.reset}`);
    fs.writeFileSync(renderYamlPath, renderYamlContent);
    console.log(`${colors.green}✅ Fichier render.yaml créé${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Fichier render.yaml existe déjà${colors.reset}`);
  }
};

// Vérifier et mettre à jour les scripts dans package.json
const updatePackageJson = () => {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (!fileExists(packageJsonPath)) {
    console.error(`${colors.red}❌ Fichier package.json introuvable${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.blue}Vérification et mise à jour des scripts dans package.json...${colors.reset}`);
  
  let packageJsonContent;
  try {
    packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors de la lecture de package.json: ${error.message}${colors.reset}`);
    return false;
  }
  
  // Ajouter ou mettre à jour les scripts nécessaires
  const requiredScripts = {
    'clean': 'rimraf dist',
    'build': 'npm run clean && npx @nestjs/cli build',
    'start:prod': 'cross-env NODE_ENV=production node dist/src/main.js',
    'start:render': 'cross-env NODE_ENV=production IS_RENDER=true node dist/src/main.js',
    'prepare:render': 'node scripts/prepare-render.js'
  };
  
  let updated = false;
  
  if (!packageJsonContent.scripts) {
    packageJsonContent.scripts = {};
  }
  
  Object.entries(requiredScripts).forEach(([key, value]) => {
    if (!packageJsonContent.scripts[key] || packageJsonContent.scripts[key] !== value) {
      packageJsonContent.scripts[key] = value;
      updated = true;
    }
  });
  
  if (updated) {
    console.log(`${colors.blue}Mise à jour des scripts dans package.json...${colors.reset}`);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
    console.log(`${colors.green}✅ Scripts mis à jour dans package.json${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Tous les scripts nécessaires sont déjà présents dans package.json${colors.reset}`);
  }
  
  return true;
};

// Supprimer les fichiers spécifiques à Vercel
const cleanupVercelFiles = () => {
  console.log(`${colors.blue}Suppression des fichiers spécifiques à Vercel...${colors.reset}`);
  
  const vercelFiles = [
    path.join(__dirname, '..', 'vercel.json'),
    path.join(__dirname, '..', 'api/index.js')
  ];
  
  vercelFiles.forEach(file => {
    if (fileExists(file)) {
      console.log(`${colors.yellow}Suppression de ${file}...${colors.reset}`);
      fs.unlinkSync(file);
      console.log(`${colors.green}✅ Fichier ${file} supprimé${colors.reset}`);
    }
  });
  
  // Supprimer le dossier api s'il est vide
  const apiDir = path.join(__dirname, '..', 'api');
  if (fileExists(apiDir)) {
    try {
      const files = fs.readdirSync(apiDir);
      if (files.length === 0) {
        fs.rmdirSync(apiDir);
        console.log(`${colors.green}✅ Dossier api supprimé (vide)${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Le dossier api contient encore des fichiers, il n'a pas été supprimé${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}❌ Erreur lors de la vérification du dossier api: ${error.message}${colors.reset}`);
    }
  }
};

// Créer un fichier .env-sample pour Render
const createEnvSample = () => {
  const envSamplePath = path.join(__dirname, '..', '.env-sample');
  const envSampleContent = `# Variables d'environnement requises pour Render
NODE_ENV=production
PORT=3001
IS_RENDER=true

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# URL de l'application
APP_URL=https://nionfar-backend.onrender.com
FRONTEND_URL=https://nion-farr.vercel.app

# CORS
CORS_ALLOWED_ORIGINS=https://nion-farr.vercel.app,http://localhost:3000

# JWT
JWT_SECRET=votre_jwt_secret_ultra_securise
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=votre_jwt_refresh_secret_ultra_securise
JWT_REFRESH_EXPIRES_IN=7d

# Email
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=votre_mot_de_passe
MAIL_FROM=noreply@nionfar.com

# Mémoire
MEMORY_OPTIMIZED=true
`;
  
  if (!fileExists(envSamplePath)) {
    console.log(`${colors.blue}Création du fichier .env-sample...${colors.reset}`);
    fs.writeFileSync(envSamplePath, envSampleContent);
    console.log(`${colors.green}✅ Fichier .env-sample créé${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Fichier .env-sample existe déjà${colors.reset}`);
  }
};

// Fonction principale
const prepareForRender = async () => {
  try {
    console.log(`${colors.bright}${colors.cyan}=== Préparation du déploiement pour Render ===${colors.reset}`);
    
    // Vérifier l'environnement
    checkEnvironment();
    
    // Mettre à jour package.json
    updatePackageJson();
    
    // Créer les fichiers nécessaires
    createProcfile();
    createRenderYaml();
    createEnvSample();
    
    // Nettoyer les fichiers Vercel
    cleanupVercelFiles();
    
    console.log(`${colors.bright}${colors.green}=== Préparation terminée avec succès ===${colors.reset}`);
    console.log(`${colors.cyan}Vous pouvez maintenant déployer votre application sur Render:${colors.reset}`);
    console.log(`${colors.cyan}1. Créez un nouveau service Web sur Render${colors.reset}`);
    console.log(`${colors.cyan}2. Connectez votre dépôt Git${colors.reset}`);
    console.log(`${colors.cyan}3. Configurez les variables d'environnement dans le dashboard Render${colors.reset}`);
    console.log(`${colors.cyan}4. Lancez le déploiement${colors.reset}`);
    
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors de la préparation pour Render: ${error.message}${colors.reset}`);
    return false;
  }
};

// Exécuter la fonction principale si ce script est appelé directement
if (require.main === module) {
  prepareForRender();
}

module.exports = {
  prepareForRender
}; 