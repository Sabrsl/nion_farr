/**
 * Script de préparation pour le déploiement sur Vercel
 * Ce script installe les dépendances nécessaires et prépare l'application NestJS
 * pour un déploiement en tant que fonction serverless sur Vercel.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Fonction pour afficher un message coloré
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Vérifier si le dossier 'api' existe
log('Vérification du dossier api...', colors.blue);
if (!fs.existsSync(path.join(__dirname, 'api'))) {
  log('Création du dossier api...', colors.yellow);
  fs.mkdirSync(path.join(__dirname, 'api'));
}

// Installer serverless-http si nécessaire
log('Vérification de l\'installation de serverless-http...', colors.blue);
try {
  log('Installation de serverless-http...', colors.yellow);
  execSync('npm install --save serverless-http', { stdio: 'inherit' });
  log('serverless-http installé avec succès', colors.green);
} catch (error) {
  log(`Erreur lors de l'installation de serverless-http: ${error.message}`, colors.red);
  process.exit(1);
}

// Compiler l'application NestJS
log('Compilation de l\'application NestJS...', colors.blue);
try {
  execSync('npm run build', { stdio: 'inherit' });
  log('Application compilée avec succès', colors.green);
} catch (error) {
  log(`Erreur lors de la compilation: ${error.message}`, colors.red);
  process.exit(1);
}

// Vérifier si le dossier 'dist' existe
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  log('Le dossier dist n\'existe pas. La compilation a échoué.', colors.red);
  process.exit(1);
}

// Vérifier si le fichier principal existe
const mainJsPath = path.join(__dirname, 'dist', 'src', 'main.js');
if (!fs.existsSync(mainJsPath)) {
  log(`Le fichier ${mainJsPath} n'existe pas. La compilation a échoué.`, colors.red);
  process.exit(1);
}

// Vérifier si le module principal existe
const appModulePath = path.join(__dirname, 'dist', 'src', 'app.module.js');
if (!fs.existsSync(appModulePath)) {
  log(`Le fichier ${appModulePath} n'existe pas. La compilation a échoué.`, colors.red);
  process.exit(1);
}

// Copier le fichier index.js dans le dossier api
log('Copie du fichier index.js dans le dossier api...', colors.blue);
const apiIndexPath = path.join(__dirname, 'api', 'index.js');
if (!fs.existsSync(apiIndexPath)) {
  log('Création du fichier index.js...', colors.yellow);
  const indexContent = `const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module');
const { ValidationPipe } = require('@nestjs/common');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS améliorée
  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : ['https://nion-farr.vercel.app'];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      
      if (corsOrigins.includes(origin) || 
          corsOrigins.includes('*') || 
          origin.includes('vercel.app') || 
          origin.includes('localhost')) {
        callback(null, true);
      } else {
        console.warn(\`🚫 Origine bloquée par CORS: \${origin}\`);
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
  }));
  
  app.use(helmet());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  await app.init();
  
  cachedApp = app;
  return app;
}

module.exports = async (req, res) => {
  console.log(\`📥 Requête reçue: \${req.method} \${req.url}\`);
  
  if (req.url === '/' || req.url === '/api') {
    return res.status(200).json({
      status: 'ok',
      message: 'NionFar API is running',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      vercel: true
    });
  }
  
  if (req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      vercel: true
    });
  }
  
  if (req.url === '/health/detailed' || req.url === '/api/health/detailed') {
    const memUsage = process.memoryUsage();
    return res.status(200).json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
      },
      vercel: true
    });
  }
  
  try {
    const server = await bootstrap();
    const serverlessHandler = serverless(server);
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la requête:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors du traitement de la requête',
      timestamp: new Date().toISOString()
    });
  }
};`;
  fs.writeFileSync(apiIndexPath, indexContent);
  log('Fichier index.js créé avec succès', colors.green);
} else {
  log('Le fichier index.js existe déjà', colors.yellow);
}

log('Préparation terminée avec succès', colors.green);
log('L\'application est prête pour le déploiement sur Vercel', colors.green);
log('N\'oubliez pas de configurer vos variables d\'environnement dans le Dashboard Vercel', colors.yellow); 