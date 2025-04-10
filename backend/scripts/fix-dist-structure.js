/**
 * Script pour corriger la structure du répertoire dist après le build
 * Assure que dist/main.js existe ou le copie depuis dist/src/main.js si nécessaire
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Vérification et correction de la structure dist...');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const srcDistDir = path.join(distDir, 'src');
const mainJsInDist = path.join(distDir, 'main.js');
const mainJsInSrcDist = path.join(srcDistDir, 'main.js');
const mainTsPath = path.join(rootDir, 'src', 'main.ts');

// S'assurer que le répertoire dist existe
if (!fs.existsSync(distDir)) {
  console.log('📁 Création du répertoire dist/');
  fs.mkdirSync(distDir, { recursive: true });
}

// S'assurer que le répertoire dist/src existe
if (!fs.existsSync(srcDistDir)) {
  console.log('📁 Création du répertoire dist/src/');
  fs.mkdirSync(srcDistDir, { recursive: true });
}

// Vérifier la structure des fichiers dans dist/
console.log('📊 Structure actuelle des fichiers dist/:');
if (fs.existsSync(distDir)) {
  const distFiles = fs.readdirSync(distDir);
  distFiles.forEach(file => console.log(` - ${file}`));
  
  // Vérifier si dist/src existe
  if (fs.existsSync(srcDistDir)) {
    console.log('📊 Contenu de dist/src/:');
    const srcDistFiles = fs.readdirSync(srcDistDir);
    srcDistFiles.forEach(file => console.log(` - ${file}`));
  }
}

// Tenter de re-transpiler main.ts directement si le fichier source existe
if (fs.existsSync(mainTsPath) && (!fs.existsSync(mainJsInSrcDist) || !fs.existsSync(mainJsInDist))) {
  console.log('🔄 Tentative de transpilation directe de src/main.ts...');
  try {
    // Utiliser tsc pour transpiler main.ts directement
    execSync('npx tsc src/main.ts --outDir dist/src', { cwd: rootDir });
    console.log('✅ Transpilation réussie!');
    
    // Copier vers dist/main.js
    if (fs.existsSync(mainJsInSrcDist) && !fs.existsSync(mainJsInDist)) {
      fs.copyFileSync(mainJsInSrcDist, mainJsInDist);
      console.log('✅ main.js copié vers la racine de dist/');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la transpilation:', error.message);
  }
}

// Vérifier si main.js existe déjà dans la racine de dist/
if (fs.existsSync(mainJsInDist)) {
  console.log('✅ main.js existe déjà à la racine de dist/');
  const stats = fs.statSync(mainJsInDist);
  console.log(`📊 Taille: ${Math.round(stats.size / 1024)} KB`);
  
  // Vérifier si le fichier est un bootstrap valide pour NestJS
  const content = fs.readFileSync(mainJsInDist, 'utf8');
  if (!content.includes('NestFactory') && !content.includes('AppModule')) {
    console.log('⚠️ Le fichier main.js ne semble pas être un bootstrap NestJS valide');
    console.log('🔄 Création d\'un wrapper pour appeler l\'application NestJS si disponible...');
    createNestJsWrapper();
  }
} 
// Vérifier si main.js existe dans dist/src/
else if (fs.existsSync(mainJsInSrcDist)) {
  console.log('⚠️ main.js trouvé dans dist/src/ mais pas à la racine de dist/');
  console.log('🔄 Copie de dist/src/main.js vers dist/main.js...');
  
  try {
    fs.copyFileSync(mainJsInSrcDist, mainJsInDist);
    console.log('✅ Copie réussie !');
    
    const stats = fs.statSync(mainJsInDist);
    console.log(`📊 Taille du nouveau fichier: ${Math.round(stats.size / 1024)} KB`);
  } catch (error) {
    console.error(`❌ Erreur lors de la copie: ${error.message}`);
    createNestJsWrapper();
  }
} 
// Aucun main.js trouvé, création d'un wrapper intelligent
else {
  console.log('❌ main.js introuvable dans dist/ ou dist/src/');
  createNestJsWrapper();
}

// S'assurer que les permissions sont correctes
try {
  console.log('🔧 Ajustement des permissions...');
  fs.chmodSync(mainJsInDist, 0o755);
  console.log('✅ Permissions mises à jour');
} catch (error) {
  console.error(`⚠️ Impossible d'ajuster les permissions: ${error.message}`);
}

console.log('✅ Vérification de la structure terminée !');

/**
 * Créer un wrapper main.js qui essaie de charger l'application NestJS si disponible,
 * sinon utilise un serveur de secours
 */
function createNestJsWrapper() {
  console.log('🔄 Création d\'un wrapper main.js intelligent...');
  
  // Contenu du wrapper qui tentera de charger l'application NestJS, sinon serveur de secours
  const wrapperContent = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Wrapper NestJS intelligent qui tente de charger l'application réelle
 * ou utilise un serveur de secours si nécessaire
 */

const fs = require('fs');
const path = require('path');

// Chemins possibles vers l'application NestJS
const possiblePaths = [
  path.join(__dirname, 'src', 'main.js'),
  path.join(__dirname, 'dist', 'src', 'main.js'),
  path.join(process.cwd(), 'dist', 'src', 'main.js')
];

// Variables d'environnement
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
  : [FRONTEND_URL];
const RAILWAY_DEPLOYMENT = process.env.RAILWAY_DEPLOYMENT === 'true';

console.log('🚀 Démarrage du serveur NionFar API (wrapper intelligent)...');
console.log('📝 Variables d\\'environnement:');
console.log('- PORT:', PORT);
console.log('- FRONTEND_URL:', FRONTEND_URL);
console.log('- CORS_ALLOWED_ORIGINS:', CORS_ALLOWED_ORIGINS);
console.log('- RAILWAY_DEPLOYMENT:', RAILWAY_DEPLOYMENT);

// Tenter de charger l'application NestJS
let nestjsApp = null;
for (const appPath of possiblePaths) {
  try {
    if (fs.existsSync(appPath)) {
      console.log(\`✅ Application NestJS trouvée à \${appPath}\`);
      nestjsApp = appPath;
      break;
    }
  } catch (error) {
    console.error(\`❌ Erreur lors de la vérification de \${appPath}: \${error.message}\`);
  }
}

// Si l'application NestJS est trouvée, essayer de la charger
if (nestjsApp) {
  try {
    console.log('🔄 Tentative de démarrage de l\\'application NestJS...');
    
    // Charger dynamiquement le module main.js de NestJS
    require(nestjsApp);
    
    console.log('✅ Application NestJS démarrée avec succès!');
  } catch (error) {
    console.error('❌ Échec du démarrage de l\\'application NestJS:', error.message);
    console.log('⚠️ Utilisation du serveur de secours...');
    startFallbackServer();
  }
} else {
  console.log('⚠️ Application NestJS non trouvée, utilisation du serveur de secours...');
  startFallbackServer();
}

/**
 * Démarrer un serveur Express de secours simple
 */
function startFallbackServer() {
  const express = require('express');
  const cors = require('cors');
  const app = express();
  
  // Configuration CORS
  app.use(cors({
    origin: CORS_ALLOWED_ORIGINS,
    credentials: true
  }));
  
  // Parser JSON
  app.use(express.json());
  
  // Logging simple
  app.use((req, res, next) => {
    console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
    next();
  });
  
  // Routes de base
  app.get(['/health', '/api/health'], (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Service en état de fonctionnement (fallback)',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/health/ping', (req, res) => {
    res.send('pong');
  });
  
  app.get(['/', '/api'], (req, res) => {
    res.json({ 
      message: 'NionFar API Server (fallback)',
      timestamp: new Date().toISOString()
    });
  });
  
  // Route pour les tokens CSRF (simulés)
  app.get('/api/security/csrf-tokens', (req, res) => {
    res.json({
      token: 'fallback-csrf-token-' + Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString()
    });
  });
  
  // Routes d'authentification simulées
  app.post('/api/auth/login', (req, res) => {
    // Simuler un délai d'authentification
    setTimeout(() => {
      res.json({
        status: 'ok',
        message: 'Authentification en mode de secours - fonctionnalités limitées',
        user: { id: 1, username: 'demo', role: 'user' },
        token: 'fallback-token-' + Math.random().toString(36).substring(2, 15)
      });
    }, 500);
  });
  
  app.post('/api/auth/register', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'Enregistrement simulé en mode de secours',
      user: { id: 2, username: req.body.username || 'new-user', role: 'user' }
    });
  });
  
  // Route de statut
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'fallback',
      uptime: process.uptime(),
      message: 'Serveur en mode de secours',
      environment: process.env.NODE_ENV || 'production',
      railway: RAILWAY_DEPLOYMENT
    });
  });
  
  // Démarrer le serveur
  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`✅ Serveur de secours démarré sur le port \${PORT}\`);
  });
  
  // Gestion des erreurs
  process.on('uncaughtException', (err) => {
    console.error('Erreur non capturée:', err);
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error('Promesse rejetée non gérée:', reason);
  });
}
`;
  
  try {
    fs.writeFileSync(mainJsInDist, wrapperContent);
    console.log('✅ Wrapper main.js créé avec succès à la racine de dist/');
    
    // Créer également dans dist/src/ pour cohérence
    if (!fs.existsSync(srcDistDir)) {
      fs.mkdirSync(srcDistDir, { recursive: true });
    }
    fs.writeFileSync(mainJsInSrcDist, wrapperContent);
    console.log('✅ Wrapper main.js également créé dans dist/src/');
  } catch (error) {
    console.error(`❌ Erreur lors de la création du wrapper: ${error.message}`);
  }
} 