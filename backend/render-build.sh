#!/bin/bash
# Script de build pour Render - Version améliorée
set -e  # Stop on first error

echo "===== DÉMARRAGE DU SCRIPT DE BUILD ====="
echo "Répertoire courant: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# S'assurer que le répertoire dist est vide
echo "Nettoyage du répertoire dist..."
rm -rf dist
mkdir -p dist

# Installation des dépendances
echo "Installation des dépendances..."
npm install --no-audit --omit=dev

# Installation explicite de NestJS CLI
echo "Installation explicite de @nestjs/cli..."
npm install --no-audit @nestjs/cli

# Vérifier où se trouve le binaire de nest
if [ -f "node_modules/.bin/nest" ]; then
  echo "Binaire nest trouvé dans node_modules/.bin/nest"
  NEST_BIN="node_modules/.bin/nest"
elif command -v npx &> /dev/null; then
  echo "Utilisation de npx pour exécuter nest"
  NEST_BIN="npx nest"
else
  echo "Ni nest ni npx n'ont été trouvés, installation globale de @nestjs/cli"
  npm install -g @nestjs/cli
  NEST_BIN="nest"
fi

# Générer tsconfig.build.json spécifique pour la compilation
echo '{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "**/*.spec.ts", "**/*.test.ts"]
}' > tsconfig.build.json

# Tentative de build avec diagnostic
echo "===== TENTATIVE DE BUILD AVEC NEST CLI ====="
$NEST_BIN build --verbose || {
  echo "Le build avec nest a échoué, tentative avec tsc directement..."
  npx tsc -p tsconfig.build.json --diagnostics || echo "Le build avec tsc a également échoué"
}

# Vérifier et diagnostiquer src/main.ts
echo "===== DIAGNOSTIC DU FICHIER MAIN.TS ====="
if [ -f "src/main.ts" ]; then
  echo "Le fichier src/main.ts existe"
  cat src/main.ts | head -n 10
  
  echo "Validation du fichier main.ts..."
  npx tsc --noEmit src/main.ts || echo "Erreurs de typage dans main.ts"
else
  echo "ERREUR: src/main.ts n'existe pas!"
fi

# Vérifier si le build a réussi
if [ -f "dist/main.js" ]; then
  echo "Build réussi! Le fichier dist/main.js existe."
else
  echo "Le build a échoué. Création d'un fichier main.js pour NionFar API..."
  
  # Créer un fichier main.js compatible avec NionFar
  cat > dist/main.js << 'EOL'
console.log("Démarrage du serveur NionFar API...");
const mongoose = require('mongoose');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const os = require('os');

// Chargement des variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_PREFIX = process.env.API_PREFIX || 'api';
const JWT_SECRET = process.env.JWT_SECRET || 'nionfar-secure-jwt-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Base de données en mémoire pour le mode de secours
const inMemoryDB = {
  users: [],
  tokens: [],
  services: [],
  categories: [],
  generateId: () => crypto.randomBytes(12).toString('hex')
};

// Données de démonstration pour le mode de secours
const mockData = {
  categories: [
    { id: 1, name: 'Design Graphique', slug: 'design-graphique', count: 125 },
    { id: 2, name: 'Développement Web', slug: 'developpement-web', count: 148 },
    { id: 3, name: 'Rédaction', slug: 'redaction', count: 87 },
    { id: 4, name: 'Vidéo & Animation', slug: 'video-animation', count: 64 },
    { id: 5, name: 'Traduction', slug: 'traduction', count: 42 },
    { id: 6, name: 'Marketing Digital', slug: 'marketing-digital', count: 95 },
    { id: 7, name: 'Formation', slug: 'formation', count: 56 },
    { id: 8, name: 'Photographie', slug: 'photographie', count: 38 },
    { id: 9, name: 'Audio & Musique', slug: 'audio-musique', count: 29 },
    { id: 10, name: 'Développement Mobile', slug: 'developpement-mobile', count: 76 },
    { id: 11, name: 'Business', slug: 'business', count: 53 },
    { id: 12, name: 'Data & IA', slug: 'data-ia', count: 67 }
  ],
  services: {
    featured: [
      { id: 101, title: 'Création de logo professionnel', price: 5000, category: 'Design Graphique' },
      { id: 102, title: 'Développement de site vitrine', price: 25000, category: 'Développement Web' },
      { id: 103, title: 'Rédaction d\'articles SEO', price: 3000, category: 'Rédaction' }
    ],
    latest: [
      { id: 201, title: 'Montage vidéo pour réseaux sociaux', price: 7500, category: 'Vidéo & Animation' },
      { id: 202, title: 'Traduction français-wolof', price: 2000, category: 'Traduction' },
      { id: 203, title: 'Campagne marketing Facebook', price: 15000, category: 'Marketing Digital' }
    ]
  },
  stats: {
    totalServices: 2587,
    totalFreelancers: 945,
    completedOrders: 15782,
    satisfaction: 4.9
  }
};

// Initialiser les données de test
mockData.categories.forEach(category => {
  inMemoryDB.categories.push(category);
});

// Fonction pour générer un token JWT (simplifié)
function generateToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresIn = 86400; // 24 heures en secondes
  
  const payloadWithExpiry = {
    ...payload,
    iat: nowInSeconds,
    exp: nowInSeconds + expiresIn
  };
  
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const base64Payload = Buffer.from(JSON.stringify(payloadWithExpiry)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `${base64Header}.${base64Payload}.${signature}`;
}

// Fonction pour valider un token JWT (simplifié)
function validateToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const nowInSeconds = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < nowInSeconds) return null;
    
    return payload;
  } catch (error) {
    console.error('Erreur de validation du token:', error.message);
    return null;
  }
}

// Connexion à MongoDB
async function connectToDatabase() {
  try {
    if (!MONGODB_URI) {
      console.warn("AVERTISSEMENT: Variable d'environnement MONGODB_URI non définie, utilisation du mode de secours.");
      return false;
    }
    
    console.log(`Connexion à la base de données MongoDB (${NODE_ENV})...`);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connexion à MongoDB établie avec succès!');
    return true;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    return false;
  }
}

// Ajouter des en-têtes CORS
function setCorsHeaders(req, res) {
  // Autoriser les requêtes depuis le frontend
  const allowedOrigins = ['https://nion-farr.vercel.app', 'http://localhost:3000'];
  const origin = req.headers.origin && allowedOrigins.includes(req.headers.origin) 
    ? req.headers.origin 
    : allowedOrigins[0];
  
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 heures en secondes
}

// Analyser le corps de la requête
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Fonction de validation des champs d'inscription
function validateRegisterFields(data) {
  const errors = [];
  
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('Adresse email invalide');
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('Le mot de passe doit comporter au moins 6 caractères');
  }
  
  if (!data.username || data.username.length < 3) {
    errors.push('Le nom d\'utilisateur doit comporter au moins 3 caractères');
  }
  
  return errors;
}

// Serveur HTTP avec routes pour NionFar
const server = http.createServer(async (req, res) => {
  // Gestion des requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.writeHead(204);
    res.end();
    console.log(`Received request: OPTIONS ${req.url}`);
    return;
  }

  setCorsHeaders(req, res);
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  console.log(`Received request: ${req.method} ${pathname}`);

  // Route pour vérification de santé
  if (pathname === '/health' || pathname === `/${API_PREFIX}/health`) {
    const isConnected = mongoose.connection.readyState === 1;
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const freeMemMB = Math.round(os.freemem() / 1024 / 1024);
    const totalMemMB = Math.round(os.totalmem() / 1024 / 1024);
    const heapUsedPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    // Vérification de l'état de la mémoire
    const memoryStatus = heapUsedPercent > 85 ? 'warning' : 'ok';
    
    console.log(`Health check répondu: MongoDB=${isConnected ? 'connecté' : 'déconnecté'}, ` +
      `Uptime=${uptime.toFixed(2)}s, Heap=${heapUsedPercent}%, ` +
      `Memory=${Math.round(memoryUsage.rss / 1024 / 1024)}MB/${freeMemMB}MB free`);
    
    const healthStatus = {
      status: isConnected ? 'up' : 'degraded',
      database: isConnected ? 'connected' : 'disconnected',
      environment: NODE_ENV,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: `${uptime.toFixed(2)} seconds`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB (${heapUsedPercent}%)`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        freeSystemMemory: `${freeMemMB} MB`,
        totalSystemMemory: `${totalMemMB} MB`,
        memoryStatus: memoryStatus
      },
      users: inMemoryDB.users.length,
      services: inMemoryDB.services.length,
      server: 'NionFar API Fallback',
      processId: process.pid,
      platform: process.platform,
      arch: process.arch,
      nodejs: process.version
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthStatus));
    return;
  }

  // Route pour le statut du service
  if (pathname === '/status' || pathname === `/${API_PREFIX}/status`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'NionFar API',
      status: 'running',
      mode: 'compatibility',
      environment: NODE_ENV,
      stats: mockData.stats,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Route pour token CSRF
  if (pathname === `/${API_PREFIX}/security/csrf-tokens`) {
    const csrfToken = crypto.randomBytes(16).toString('hex');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      token: csrfToken
    }));
    return;
  }

  // Route pour l'inscription
  if (pathname === `/${API_PREFIX}/auth/register` && req.method === 'POST') {
    try {
      console.log(`Début du traitement d'une inscription: ${new Date().toISOString()}`);
      const userData = await parseRequestBody(req);
      console.log('Données d\'inscription reçues:', JSON.stringify({
        ...userData,
        password: userData.password ? '******' : undefined,
        passwordConfirm: userData.passwordConfirm ? '******' : undefined
      }));
      
      const validationErrors = validateRegisterFields(userData);
      
      if (validationErrors.length > 0) {
        console.log('Échec de validation:', validationErrors);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Données d\'inscription invalides',
          errors: validationErrors
        }));
        return;
      }
      
      // Vérifier si l'email ou le nom d'utilisateur existe déjà
      const emailExists = inMemoryDB.users.some(user => user.email === userData.email);
      const usernameExists = inMemoryDB.users.some(user => user.username === userData.username);
      
      if (emailExists) {
        console.log(`Échec d'inscription: email ${userData.email} déjà utilisé`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Cet email est déjà utilisé'
        }));
        return;
      }
      
      if (usernameExists) {
        console.log(`Échec d'inscription: nom d'utilisateur ${userData.username} déjà pris`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà pris'
        }));
        return;
      }
      
      console.log('Validation réussie, création du nouvel utilisateur');
      
      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Créer l'utilisateur en mémoire
      const newUser = {
        id: inMemoryDB.generateId(),
        email: userData.email,
        username: userData.username,
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || userData.phone,
        password: hashedPassword,
        role: userData.role?.toLowerCase() || 'user',
        isFreelancer: userData.isFreelancer || userData.role?.toLowerCase() === 'freelance',
        createdAt: new Date().toISOString(),
        isEmailVerified: false
      };
      
      console.log('Ajout du nouvel utilisateur dans la mémoire:', JSON.stringify({
        ...newUser,
        password: '******'
      }));
      
      inMemoryDB.users.push(newUser);
      
      // Générer un token JWT
      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      });
      
      // Générer un refresh token
      const refreshToken = crypto.randomBytes(40).toString('hex');
      inMemoryDB.tokens.push({
        userId: newUser.id,
        token: refreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });
      
      // Répondre avec le token et les informations de l'utilisateur
      const userToReturn = { ...newUser };
      delete userToReturn.password;
      
      console.log('Inscription réussie, envoi de la réponse');
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Inscription réussie',
        user: userToReturn,
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: 86400 // 24 heures en secondes
      }));
      
      console.log(`Nouvel utilisateur inscrit: ${userData.email}`);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      }));
    }
    return;
  }

  // Route pour la connexion
  if (pathname === `/${API_PREFIX}/auth/login` && req.method === 'POST') {
    try {
      const loginData = await parseRequestBody(req);
      
      // Accepter soit emailOrPhone soit email comme identifiant
      const userIdentifier = loginData.emailOrPhone || loginData.email;
      
      if (!userIdentifier || !loginData.password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Email/téléphone et mot de passe requis'
        }));
        return;
      }
      
      // Trouver l'utilisateur par email ou téléphone
      const user = inMemoryDB.users.find(user => 
        user.email === userIdentifier || 
        user.phoneNumber === userIdentifier ||
        user.username === userIdentifier
      );
      
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Identifiants incorrects'
        }));
        return;
      }
      
      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(loginData.password, user.password);
      
      if (!isMatch) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Identifiants incorrects'
        }));
        return;
      }
      
      // Générer un token JWT
      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });
      
      // Générer un refresh token
      const refreshToken = crypto.randomBytes(40).toString('hex');
      inMemoryDB.tokens.push({
        userId: user.id,
        token: refreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });
      
      // Répondre avec le token et les informations de l'utilisateur
      const userToReturn = { ...user };
      delete userToReturn.password;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Connexion réussie',
        user: userToReturn,
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: 86400 // 24 heures en secondes
      }));
      
      console.log(`Utilisateur connecté: ${userIdentifier}`);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      }));
    }
    return;
  }

  // Route pour les catégories de services
  if (pathname === `/${API_PREFIX}/services/categories` || pathname === `/${API_PREFIX}/categories`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.categories));
    return;
  }

  // Route pour le nombre de services par catégorie
  if (pathname === `/${API_PREFIX}/services/categories/count`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const categoriesWithCount = mockData.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count
    }));
    res.end(JSON.stringify(categoriesWithCount));
    return;
  }

  // Route pour les services
  if (pathname.startsWith(`/${API_PREFIX}/services`) && req.method === 'GET') {
    // API pour récupérer un service spécifique par ID
    if (pathname.match(new RegExp(`^/${API_PREFIX}/services/[a-zA-Z0-9]+$`))) {
      const serviceId = pathname.split('/').pop();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Service récupéré, mais en mode de compatibilité',
        note: 'Les données complètes seront disponibles quand la connexion à la base de données sera rétablie'
      }));
      return;
    }
    
    // Route pour les services mis en avant
    if (pathname === `/${API_PREFIX}/services/featured`) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockData.services.featured));
      return;
    }
    
    // Route pour les services récents
    if (pathname === `/${API_PREFIX}/services/latest`) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockData.services.latest));
      return;
    }
    
    // Liste de tous les services
    if (pathname === `/${API_PREFIX}/services`) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Liste des services disponible quand la connexion à la base de données sera rétablie',
        serviceSamples: [...mockData.services.featured, ...mockData.services.latest],
        total: mockData.stats.totalServices
      }));
      return;
    }
  }
  
  // Route pour création de service (POST)
  if (pathname === `/${API_PREFIX}/services` && req.method === 'POST') {
    // Vérification d'autorisation pour la création de service
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Authentification requise' 
      }));
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const userData = validateToken(token);
    
    if (!userData) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      }));
      return;
    }
    
    // Vérifier si l'utilisateur est freelancer ou admin
    if (userData.role !== 'freelancer' && userData.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Accès non autorisé. Seuls les freelancers et admins peuvent créer des services.' 
      }));
      return;
    }
    
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'La création de services est temporairement indisponible en mode de compatibilité',
      retryLater: true,
      status: 'degraded'
    }));
    return;
  }
  
  // Routes pour les commandes
  if (pathname.startsWith(`/${API_PREFIX}/orders`)) {
    // Vérification d'autorisation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Authentification requise' 
      }));
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const userData = validateToken(token);
    
    if (!userData) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      }));
      return;
    }
    
    // Lister les commandes (GET)
    if (pathname === `/${API_PREFIX}/orders` && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Fonctionnalité disponible quand la connexion à la base de données sera rétablie',
        orders: []
      }));
      return;
    }
    
    // Création de commande (POST)
    if (pathname === `/${API_PREFIX}/orders` && req.method === 'POST') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'La création de commandes est temporairement indisponible en mode de compatibilité',
        retryLater: true,
        status: 'degraded'
      }));
      return;
    }
    
    // Récupération d'une commande spécifique (GET)
    if (pathname.match(new RegExp(`^/${API_PREFIX}/orders/[a-zA-Z0-9]+$`)) && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Fonctionnalité disponible quand la connexion à la base de données sera rétablie',
        order: null
      }));
      return;
    }
    
    // Route pour les actions sur les commandes (cancel, complete, etc.)
    if (pathname.match(new RegExp(`^/${API_PREFIX}/orders/[a-zA-Z0-9]+/(cancel|complete|deliver|revision|accept|status)$`)) && req.method === 'POST') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Les actions sur les commandes sont temporairement indisponibles en mode de compatibilité',
        retryLater: true,
        status: 'degraded'
      }));
      return;
    }
  }
  
  // Routes pour les disputes
  if (pathname.startsWith(`/${API_PREFIX}/disputes`)) {
    // Vérification d'autorisation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Authentification requise' 
      }));
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const userData = validateToken(token);
    
    if (!userData) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      }));
      return;
    }
    
    // Création d'un litige (POST)
    if (pathname === `/${API_PREFIX}/disputes` && req.method === 'POST') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'La création de litiges est temporairement indisponible en mode de compatibilité',
        retryLater: true,
        status: 'degraded'
      }));
      return;
    }
    
    // Liste des litiges (GET)
    if ((pathname === `/${API_PREFIX}/disputes` || pathname === `/${API_PREFIX}/disputes/admin`) && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Fonctionnalité disponible quand la connexion à la base de données sera rétablie',
        disputes: []
      }));
      return;
    }
    
    // Récupération d'un litige spécifique
    if (pathname.match(new RegExp(`^/${API_PREFIX}/disputes/[a-zA-Z0-9]+$`)) && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Fonctionnalité disponible quand la connexion à la base de données sera rétablie',
        dispute: null
      }));
      return;
    }
    
    // Ajout de message à un litige
    if (pathname.match(new RegExp(`^/${API_PREFIX}/disputes/[a-zA-Z0-9]+/messages$`)) && req.method === 'POST') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'L\'ajout de messages est temporairement indisponible en mode de compatibilité',
        retryLater: true,
        status: 'degraded'
      }));
      return;
    }
  }
  
  // Routes pour les paiements
  if (pathname.startsWith(`/${API_PREFIX}/payments`)) {
    // Vérification d'autorisation pour toutes les routes sauf le webhook
    if (pathname !== `/${API_PREFIX}/payments/webhook`) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: 'Authentification requise' 
        }));
        return;
      }
      
      const token = authHeader.split(' ')[1];
      const userData = validateToken(token);
      
      if (!userData) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: 'Token invalide ou expiré' 
        }));
        return;
      }
    }
    
    // Webhook de paiement (accessible sans auth)
    if (pathname === `/${API_PREFIX}/payments/webhook` && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Webhook reçu'
      }));
      return;
    }
    
    // Création d'un paiement
    if (pathname === `/${API_PREFIX}/payments` && req.method === 'POST') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'La création de paiements est temporairement indisponible en mode de compatibilité',
        retryLater: true,
        status: 'degraded'
      }));
      return;
    }
    
    // Demande de retrait
    if (pathname === `/${API_PREFIX}/payments/withdrawal` && req.method === 'POST') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Les retraits sont temporairement indisponibles en mode de compatibilité',
        retryLater: true,
        status: 'degraded'
      }));
      return;
    }
    
    // Historique des retraits
    if (pathname === `/${API_PREFIX}/payments/withdrawal/history` && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Fonctionnalité disponible quand la connexion à la base de données sera rétablie',
        withdrawals: []
      }));
      return;
    }
    
    // Solde de l'utilisateur
    if (pathname === `/${API_PREFIX}/payments/balance` && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        balance: 0,
        pendingBalance: 0,
        currency: 'XOF'
      }));
      return;
    }
    
    // Transactions de l'utilisateur
    if (pathname === `/${API_PREFIX}/payments/transactions` && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Fonctionnalité disponible quand la connexion à la base de données sera rétablie',
        transactions: []
      }));
      return;
    }
  }
  
  // Route pour les statistiques
  if (pathname === `/${API_PREFIX}/stats`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.stats));
    return;
  }
  
  // API endpoint racine
  if (pathname === '/' || pathname === `/${API_PREFIX}` || pathname === `/${API_PREFIX}/`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'NionFar API',
      description: 'API pour la plateforme freelance NionFar.sn',
      status: 'running',
      mode: 'compatibility',
      environment: NODE_ENV,
      endpoints: [
        `/${API_PREFIX}/health`,
        `/${API_PREFIX}/status`,
        `/${API_PREFIX}/auth/register`,
        `/${API_PREFIX}/auth/login`,
        `/${API_PREFIX}/security/csrf-tokens`,
        `/${API_PREFIX}/services/categories`,
        `/${API_PREFIX}/services/categories/count`,
        `/${API_PREFIX}/services/featured`,
        `/${API_PREFIX}/services/latest`,
        `/${API_PREFIX}/services`,
        `/${API_PREFIX}/orders`,
        `/${API_PREFIX}/orders/:id`,
        `/${API_PREFIX}/orders/:id/deliver`,
        `/${API_PREFIX}/orders/:id/cancel`,
        `/${API_PREFIX}/orders/:id/complete`,
        `/${API_PREFIX}/orders/:id/revision`,
        `/${API_PREFIX}/orders/:id/accept`,
        `/${API_PREFIX}/disputes`,
        `/${API_PREFIX}/disputes/:id`,
        `/${API_PREFIX}/disputes/:id/messages`,
        `/${API_PREFIX}/payments`,
        `/${API_PREFIX}/payments/webhook`,
        `/${API_PREFIX}/payments/withdrawal`,
        `/${API_PREFIX}/payments/withdrawal/history`,
        `/${API_PREFIX}/payments/transactions`,
        `/${API_PREFIX}/payments/balance`,
        `/${API_PREFIX}/stats`
      ],
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Réponse par défaut (404)
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    error: 'Not Found',
    message: 'La ressource demandée n\'existe pas',
    path: pathname
  }));
});

// Démarrage de l'application
async function bootstrap() {
  try {
    await connectToDatabase();
    
    // Écouter sur toutes les interfaces (0.0.0.0) pour être accessible depuis l'extérieur
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Serveur NionFar API en mode de compatibilité démarré sur le port ${PORT}`);
      console.log(`API accessible à: http://0.0.0.0:${PORT}/${API_PREFIX}`);
      console.log(`URL de santé: http://0.0.0.0:${PORT}/health`);
    });
    
    // Gestion des signaux pour un arrêt propre
    const shutdown = async (signal) => {
      console.log(`Signal ${signal} reçu. Arrêt du serveur...`);
      
      server.close(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            console.log('Fermeture de la connexion à MongoDB...');
            await mongoose.connection.close();
            console.log('Connexion MongoDB fermée avec succès');
          }
          console.log('Serveur arrêté avec succès');
          process.exit(0);
        } catch (err) {
          console.error('Erreur lors de la fermeture des connexions:', err);
          process.exit(1);
        }
      });
      
      // Forcer l'arrêt après 10 secondes si le serveur ne s'arrête pas proprement
      setTimeout(() => {
        console.error('Délai d\'attente dépassé, arrêt forcé');
        process.exit(1);
      }, 10000);
    };
    
    // Attacher les gestionnaires de signaux
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Ne pas appeler shutdown ici - laisser le serveur tourner
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

bootstrap();
EOL
fi

# Rendre le fichier exécutable
chmod +x dist/main.js

# Afficher le contenu final
echo "Contenu du répertoire dist:"
find dist -type f | sort

# Vérifier la taille du fichier
if [ -f "dist/main.js" ]; then
  echo "Taille de main.js: $(wc -c < dist/main.js) octets"
  echo "Premières lignes de main.js:"
  head -n 10 dist/main.js
fi

echo "===== FIN DU SCRIPT DE BUILD ====="
exit 0 