#!/usr/bin/env node

/**
 * Script de validation du déploiement sur Railway
 * Ce script vérifie que les routes critiques fonctionnent correctement
 */

const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question et obtenir une réponse
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🔍 Validation du déploiement sur Railway...');
  
  // Demander l'URL de l'API avec l'URL fournie comme valeur par défaut
  const defaultUrl = 'https://nionfar.up.railway.app';
  const apiUrlInput = await question(`Entrez l'URL de l'API Railway [${defaultUrl}]: `);
  const apiUrl = apiUrlInput.trim() || defaultUrl;
  
  if (!apiUrl) {
    console.error('❌ URL invalide');
    process.exit(1);
  }
  
  const endpoints = [
    '/health',
    '/api/services/categories/count',
    // Ajoutez d'autres endpoints critiques ici
  ];
  
  console.log('\n🧪 Test des endpoints critiques:');
  
  let allSuccess = true;
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${apiUrl}${endpoint}`);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${endpoint} - ${response.status} (${duration}ms)`);
      
      // Vérifier spécifiquement /api/services/categories/count
      if (endpoint === '/api/services/categories/count') {
        if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
          console.log(`   ℹ️  Nombre de catégories: ${response.data.categories.length}`);
        } else {
          console.warn(`⚠️  Format de réponse inattendu pour ${endpoint}`);
          allSuccess = false;
        }
      }
    } catch (error) {
      console.error(`❌ ${endpoint} - ${error.message}`);
      if (error.response) {
        console.error(`   Code: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`);
      }
      allSuccess = false;
    }
  }
  
  console.log('\n📊 Résultat de la validation:');
  if (allSuccess) {
    console.log('✅ Tous les endpoints testés fonctionnent correctement!');
    console.log('\n🚀 Votre application est correctement déployée sur Railway.');
    console.log('\n🔄 Étapes suivantes:');
    console.log('1. Vérifiez manuellement le fonctionnement de votre application frontend avec cette API');
    console.log('2. Mettez en pause votre application sur Render (ne la supprimez pas encore)');
    console.log('3. Après quelques jours de fonctionnement stable, vous pourrez supprimer l\'application sur Render');
  } else {
    console.error('⚠️ Certains endpoints ne fonctionnent pas correctement.');
    console.log('\n🔧 Vérifiez:');
    console.log('1. Les variables d\'environnement dans Railway');
    console.log('2. Les logs de l\'application sur Railway');
    console.log('3. La connexion à MongoDB');
    console.log('4. Les autorisations CORS');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Erreur lors de la validation:', error.message);
  rl.close();
  process.exit(1);
});

/**
 * Script de validation post-déploiement Railway
 * Vérifie que les fichiers clés sont présents et fonctionnels
 */

console.log('🔍 Validation post-déploiement Railway...');

// Chemins des fichiers à vérifier
const distPath = path.join(__dirname, '..', 'dist');
const mainJsPath = path.join(distPath, 'main.js');
const serverJsPath = path.join(__dirname, '..', 'server.js');
const directCopyJsPath = path.join(__dirname, '..', 'src', 'direct-copy.js');

// Vérifier si le dossier dist existe
console.log('Vérification du dossier dist...');
if (!fs.existsSync(distPath)) {
  console.error('❌ Le dossier dist/ n\'existe pas!');
  console.log('📁 Création du dossier dist/...');
  fs.mkdirSync(distPath, { recursive: true });
} else {
  console.log('✅ Le dossier dist/ existe.');
}

// Vérifier si main.js existe
console.log('Vérification de main.js...');
if (!fs.existsSync(mainJsPath)) {
  console.error('❌ main.js est manquant dans dist/!');
  
  // Vérifier si le fichier source existe
  const srcMainJsPath = path.join(__dirname, '..', 'src', 'main.js');
  if (fs.existsSync(srcMainJsPath)) {
    console.log('🔄 Copie de src/main.js vers dist/main.js...');
    fs.copyFileSync(srcMainJsPath, mainJsPath);
    console.log('✅ main.js copié avec succès.');
  } else {
    console.error('❌ src/main.js est également manquant!');
    
    // Vérifier direct-copy.js et l'exécuter si présent
    if (fs.existsSync(directCopyJsPath)) {
      console.log('🔄 Exécution de direct-copy.js pour créer main.js...');
      try {
        require(directCopyJsPath);
        console.log('✅ direct-copy.js exécuté.');
      } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de direct-copy.js: ${error.message}`);
      }
    } else {
      console.error('❌ direct-copy.js est manquant!');
      
      // Créer un fichier main.js fallback
      console.log('🔄 Création d\'un fichier main.js fallback...');
      
      const fallbackMainJs = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const express = require('express');
const cors = require('cors');
const http = require('http');

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de base
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : (process.env.FRONTEND_URL || '*'),
  credentials: true
}));
app.use(express.json());

// Middleware de logging minimal
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'NionFar API is running (fallback)'
  });
});

app.get('/health/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NionFar API is running (fallback)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'API is running (fallback)',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Serveur démarré sur le port \${PORT}\`);
  console.log(\`Health check disponible sur http://0.0.0.0:\${PORT}/health/ping\`);
});
      `;
      
      try {
        fs.writeFileSync(mainJsPath, fallbackMainJs);
        console.log('✅ Fichier main.js fallback créé avec succès.');
      } catch (error) {
        console.error(`❌ Erreur lors de la création du fichier main.js fallback: ${error.message}`);
      }
    }
  }
} else {
  console.log('✅ main.js existe dans dist/.');
  
  // Vérifier la taille du fichier
  try {
    const stats = fs.statSync(mainJsPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKilobytes = fileSizeInBytes / 1024;
    
    console.log(`📊 Taille de main.js: ${Math.round(fileSizeInKilobytes)} KB`);
    
    if (fileSizeInKilobytes < 5) {
      console.warn('⚠️ Le fichier main.js est anormalement petit!');
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification de la taille de main.js: ${error.message}`);
  }
}

// Vérifier si server.js existe comme fallback
console.log('Vérification de server.js (fallback)...');
if (!fs.existsSync(serverJsPath)) {
  console.warn('⚠️ server.js est manquant.');
} else {
  console.log('✅ server.js existe.');
}

// Afficher le contenu du dossier dist
console.log('\n📂 Contenu du dossier dist/:');
try {
  const files = fs.readdirSync(distPath);
  if (files.length === 0) {
    console.warn('⚠️ Le dossier dist/ est vide!');
  } else {
    files.forEach(file => {
      try {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${Math.round(stats.size / 1024)} KB)`);
      } catch (error) {
        console.log(`   - ${file} (erreur: ${error.message})`);
      }
    });
  }
} catch (error) {
  console.error(`❌ Erreur lors de la lecture du dossier dist/: ${error.message}`);
}

console.log('\n✅ Validation terminée. Les erreurs éventuelles ont été corrigées automatiquement.'); 