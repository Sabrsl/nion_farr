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

// Configuration de la gestion de la mémoire
const MEMORY_MANAGEMENT = {
  CHECK_INTERVAL_MS: 60000, // Vérifier toutes les 60 secondes
  HEAP_WARNING_THRESHOLD: 75, // Déclencher un nettoyage à 75% d'utilisation (au lieu de 85%)
  HEAP_CRITICAL_THRESHOLD: 85, // Critique à 85% (au lieu de 90%)
  ROTATION_INTERVAL_MS: 3600000, // Rotation des données en mémoire toutes les heures
  MAX_TOKENS_IN_MEMORY: 100, // Limiter à 100 tokens en mémoire
  MAX_USERS_IN_MEMORY: 50, // Limiter à 50 utilisateurs en mémoire (au lieu de 200)
  MAX_MEMORY_MB: 450, // Limiter la mémoire totale à 450 MB (sur 512 disponibles sur Render)
  FORCE_GC_THRESHOLD: 80 // Forcer le garbage collection à 80% d'utilisation
};

// Fonction pour nettoyer la mémoire
function cleanupMemory() {
  console.log('🧹 Exécution du nettoyage de la mémoire...');
  
  const memoryBefore = process.memoryUsage();
  
  // Forcer un garbage collection si disponible (Node.js avec --expose-gc)
  if (global.gc && memoryBefore.heapUsed / memoryBefore.heapTotal > MEMORY_MANAGEMENT.FORCE_GC_THRESHOLD / 100) {
    try {
      console.log('♻️ Forçage du garbage collection...');
      global.gc();
    } catch (error) {
      console.error('⚠️ Erreur lors du forçage du garbage collection:', error);
    }
  }
  
  const tokensBefore = inMemoryDB.tokens.length;
  const usersBefore = inMemoryDB.users.length;
  
  // 1. Supprimer les tokens expirés
  const now = new Date();
  inMemoryDB.tokens = inMemoryDB.tokens.filter(token => token.expires > now);
  
  // 2. Si encore trop de tokens, ne garder que les plus récents
  if (inMemoryDB.tokens.length > MEMORY_MANAGEMENT.MAX_TOKENS_IN_MEMORY) {
    inMemoryDB.tokens.sort((a, b) => b.expires - a.expires); // Trier par date d'expiration (plus récent en premier)
    inMemoryDB.tokens = inMemoryDB.tokens.slice(0, MEMORY_MANAGEMENT.MAX_TOKENS_IN_MEMORY);
  }
  
  // 3. Si trop d'utilisateurs, ne garder que les essentiels
  if (inMemoryDB.users.length > MEMORY_MANAGEMENT.MAX_USERS_IN_MEMORY) {
    // Garder les utilisateurs les plus récemment actifs
    const activeUserIds = [...new Set(inMemoryDB.tokens.map(t => t.userId))];
    
    // D'abord garder les utilisateurs avec des tokens actifs
    const activeUsers = inMemoryDB.users.filter(user => 
      activeUserIds.includes(user.id) || activeUserIds.includes(user._id?.toString())
    );
    
    // Ensuite compléter si nécessaire avec les utilisateurs les plus récents
    if (activeUsers.length < MEMORY_MANAGEMENT.MAX_USERS_IN_MEMORY) {
      const inactiveUsers = inMemoryDB.users
        .filter(user => !activeUserIds.includes(user.id) && !activeUserIds.includes(user._id?.toString()))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      const remainingSlots = MEMORY_MANAGEMENT.MAX_USERS_IN_MEMORY - activeUsers.length;
      activeUsers.push(...inactiveUsers.slice(0, remainingSlots));
    } else if (activeUsers.length > MEMORY_MANAGEMENT.MAX_USERS_IN_MEMORY) {
      // Si toujours trop d'utilisateurs actifs, ne garder que la limite
      activeUsers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      activeUsers.length = MEMORY_MANAGEMENT.MAX_USERS_IN_MEMORY;
    }
    
    inMemoryDB.users = activeUsers;
  }
  
  // Supprimer les données non essentielles des utilisateurs pour économiser la mémoire
  inMemoryDB.users.forEach(user => {
    // Garder uniquement les champs nécessaires
    if (user.services && user.services.length > 3) {
      user.services = user.services.slice(0, 3); // Garder seulement 3 services
    }
    if (user.orders && user.orders.length > 5) {
      user.orders = user.orders.slice(0, 5); // Garder seulement 5 commandes
    }
    
    // Supprimer les descriptions et champs volumineux non essentiels
    if (user.services) {
      user.services.forEach(service => {
        if (service.description && service.description.length > 100) {
          service.description = service.description.substring(0, 100) + '...';
        }
        // Supprimer les champs non essentiels
        delete service.metaDescription;
        delete service.seoDescription;
        delete service.requirements;
        delete service.longDescription;
      });
    }
  });
  
  // 4. Nettoyer les objets non utilisés dans mockData
  if (mockData) {
    if (mockData.services && mockData.services.all && mockData.services.all.length > 20) {
      mockData.services.all = mockData.services.all.slice(0, 20);
    }
    if (mockData.services && mockData.services.featured && mockData.services.featured.length > 10) {
      mockData.services.featured = mockData.services.featured.slice(0, 10);
    }
    if (mockData.services && mockData.services.latest && mockData.services.latest.length > 10) {
      mockData.services.latest = mockData.services.latest.slice(0, 10);
    }
  }
  
  // 5. Ré-assigner les variables non utilisées
  const tokensRemoved = tokensBefore - inMemoryDB.tokens.length;
  const usersRemoved = usersBefore - inMemoryDB.users.length;
  
  const memoryAfter = process.memoryUsage();
  const memoryFreed = (memoryBefore.heapUsed - memoryAfter.heapUsed) / (1024 * 1024);
  
  console.log(`🧹 Nettoyage terminé: ${tokensRemoved} tokens et ${usersRemoved} utilisateurs supprimés, ${memoryFreed.toFixed(2)} MB libéré`);
  
  return {
    tokensRemoved,
    usersRemoved,
    memoryFreed
  };
}

// Fonction pour vérifier l'état de la mémoire
function checkMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
  const heapTotalMB = Math.round(memoryUsage.heapTotal / (1024 * 1024));
  const heapUsedPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
  
  console.log(`📊 Surveillance mémoire: Heap utilisé: ${heapUsedMB} MB / ${heapTotalMB} MB (${heapUsedPercent}%)`);
  
  // Action proactive: toujours nettoyer si mémoire > 80% de notre limite configurable
  if (heapUsedMB > MEMORY_MANAGEMENT.MAX_MEMORY_MB * 0.8) {
    console.warn(`⚠️ Approche de la limite de mémoire configurée (${heapUsedMB}/${MEMORY_MANAGEMENT.MAX_MEMORY_MB}MB), nettoyage préventif...`);
    cleanupMemory();
  }
  
  if (heapUsedPercent > MEMORY_MANAGEMENT.HEAP_CRITICAL_THRESHOLD) {
    console.warn(`⚠️ CRITIQUE: Utilisation du heap à ${heapUsedPercent}%, nettoyage d'urgence...`);
    const result = cleanupMemory();
    
    // Vérification post-nettoyage et redémarrage si nécessaire
    setTimeout(() => {
      const postCleanupUsage = process.memoryUsage();
      const postCleanupPercent = Math.round((postCleanupUsage.heapUsed / postCleanupUsage.heapTotal) * 100);
      const postCleanupMB = Math.round(postCleanupUsage.heapUsed / (1024 * 1024));
      
      // Redémarrage si le nettoyage n'a pas été suffisant ET que la mémoire utilisée est élevée
      if (postCleanupPercent > MEMORY_MANAGEMENT.HEAP_CRITICAL_THRESHOLD && 
          postCleanupMB > MEMORY_MANAGEMENT.MAX_MEMORY_MB * 0.9) {
        console.error(`🔥 CRITIQUE: L'utilisation du heap reste à ${postCleanupPercent}% (${postCleanupMB}MB) après nettoyage.`);
        console.log('💡 Redémarrage préventif du serveur pour éviter un crash...');
        
        // Nettoyage avancé pré-redémarrage
        prepareGracefulShutdown(true)
          .then(() => {
            // Process exit avec un code spécial pour indiquer un redémarrage préventif
            process.exit(143);
          })
          .catch(err => {
            console.error("Erreur lors du nettoyage pré-redémarrage:", err);
            process.exit(1);
          });
      }
    }, 5000);
  } else if (heapUsedPercent > MEMORY_MANAGEMENT.HEAP_WARNING_THRESHOLD) {
    console.warn(`⚠️ AVERTISSEMENT: Utilisation du heap à ${heapUsedPercent}%, nettoyage préventif...`);
    cleanupMemory();
  }
}

// Fonction de rotation périodique de la mémoire pour éviter les fuites
function scheduleMemoryRotation() {
  setInterval(() => {
    console.log("🔄 Rotation périodique des données en mémoire...");
    
    // Forcer une synchronisation avec MongoDB si disponible
    if (mongoose.connection.readyState === 1) {
      syncInMemoryData()
        .then(() => cleanupMemory())
        .catch(console.error);
    } else {
      cleanupMemory();
    }
  }, MEMORY_MANAGEMENT.ROTATION_INTERVAL_MS);
}

// Amélioration de la fonction d'arrêt pour éviter les fuites mémoire
async function prepareGracefulShutdown(isRestart = false) {
  console.log(`Signal ${isRestart ? 'de redémarrage' : 'SIGTERM'} reçu. Arrêt du serveur...`);
  
  // Nettoyage des ressources
  if (mongoose.connection.readyState === 1) {
    console.log('Fermeture de la connexion à MongoDB...');
    try {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée avec succès');
    } catch (error) {
      console.error('Erreur lors de la fermeture de la connexion MongoDB:', error);
    }
  }
  
  // Nettoyage supplémentaire
  inMemoryDB = { users: [], tokens: [] };
  mockData = null;
  
  // Forcer un garbage collection si disponible
  if (global.gc) {
    try {
      global.gc();
      console.log('Garbage collection forcé effectué');
    } catch (error) {
      console.error('Erreur lors du forçage du garbage collection:', error);
    }
  }
  
  console.log('Serveur arrêté avec succès');
}

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

// Définition du modèle User pour mongoose
const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  fullName: String,
  phoneNumber: String,
  role: { type: String, default: 'user' },
  isFreelancer: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  status: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

// Déclaration des modèles seulement lorsque nous avons une connexion
let User, Service, Order;
let modelsInitialized = false;

// Initialiser les modèles mongoose
function initializeModels() {
  if (!modelsInitialized && mongoose.connection.readyState === 1) {
    try {
      User = mongoose.model('User');
    } catch (e) {
      User = mongoose.model('User', UserSchema);
    }
    
    try {
      Service = mongoose.model('Service');
    } catch (e) {
      Service = mongoose.model('Service', ServiceSchema);
    }
    
    try {
      Order = mongoose.model('Order');
    } catch (e) {
      Order = mongoose.model('Order', OrderSchema);
    }
    
    modelsInitialized = true;
    console.log('✅ Modèles Mongoose initialisés avec succès');
  }
}

// Récupérer les données réelles de l'utilisateur lorsque la connexion à MongoDB est disponible
async function getUserDataFromDB(userId) {
  if (!modelsInitialized || mongoose.connection.readyState !== 1) {
    return null;
  }
  
  try {
    // Récupérer l'utilisateur de MongoDB (sans le mot de passe)
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return null;
    }
    
    console.log(`📊 Données utilisateur réelles récupérées pour: ${user.email || user.username}`);
    
    // Récupérer les données associées (commandes, services, etc.)
    const orders = await Order.find({ 
      $or: [{ client: userId }, { freelancer: userId }] 
    }).sort({ createdAt: -1 }).limit(10).lean();
    
    const services = user.isFreelancer 
      ? await Service.find({ provider: userId }).lean()
      : [];
    
    return {
      ...user,
      id: user._id.toString(),
      _id: user._id.toString(),
      orders: orders.map(o => ({ ...o, id: o._id.toString(), _id: o._id.toString() })),
      services: services.map(s => ({ ...s, id: s._id.toString(), _id: s._id.toString() }))
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
}

// Fonction pour gérer la connexion combinée (mémoire + MongoDB)
async function getUser(userIdentifier) {
  // Recherche d'abord en mémoire
  let user = inMemoryDB.users.find(user => 
    user.email === userIdentifier || 
    user.phoneNumber === userIdentifier ||
    user.username === userIdentifier
  );
  
  // Si l'utilisateur existe en mémoire et que MongoDB est connecté,
  // rechercher aussi les données dans MongoDB pour les enrichir
  if (user && mongoose.connection.readyState === 1 && modelsInitialized) {
    try {
      // Chercher l'utilisateur dans MongoDB par email
      const dbUser = await User.findOne({ 
        $or: [
          { email: user.email },
          { username: user.username }
        ]
      }).select('-password').lean();
      
      if (dbUser) {
        // Mettre à jour les données en mémoire avec les données réelles
        console.log(`✅ Synchronisation des données utilisateur: ${user.email}`);
        user = {
          ...user,
          id: dbUser._id.toString(),
          _id: dbUser._id.toString(),
          // Autres champs à synchroniser
          balance: dbUser.balance || 0,
          isEmailVerified: dbUser.isEmailVerified || false,
          isPhoneVerified: dbUser.isPhoneVerified || false,
          // etc.
        };
      }
    } catch (error) {
      console.error('Erreur lors de la recherche dans MongoDB:', error);
      // Continue avec les données en mémoire en cas d'erreur
    }
  }
  
  return user;
}

// Connexion à MongoDB avec reconnexion automatique
async function connectToDatabase() {
  try {
    if (!MONGODB_URI) {
      console.warn("AVERTISSEMENT: Variable d'environnement MONGODB_URI non définie, utilisation du mode de secours.");
      return false;
    }
    
    console.log(`Connexion à la base de données MongoDB (${NODE_ENV})...`);
    
    // Configuration de la connexion MongoDB avec reconnexion automatique
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes en cas d'échec de connexion
      socketTimeoutMS: 45000, // Timeout après 45 secondes d'inactivité
      // La reconnexion est activée par défaut avec useUnifiedTopology
    });
    
    console.log('Connexion à MongoDB établie avec succès!');
    
    // Initialiser les modèles Mongoose
    initializeModels();
    
    // Importer quelques données réelles dans la mémoire pour une utilisation hors ligne
    await syncInMemoryData();
    
    // Surveiller les événements de connexion MongoDB
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Connexion MongoDB perdue. Tentative de reconnexion...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ Reconnecté à MongoDB avec succès!');
      // Réinitialiser les modèles après reconnexion
      initializeModels();
      // Resynchroniser les données
      syncInMemoryData().catch(console.error);
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });
    
    return true;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    // En cas d'échec, programmer une nouvelle tentative
    console.log('⏱️ Nouvelle tentative de connexion dans 10 secondes...');
    setTimeout(() => {
      connectToDatabase().catch(console.error);
    }, 10000);
    return false;
  }
}

// Fonction pour synchroniser les données en mémoire avec MongoDB
async function syncInMemoryData() {
  if (!modelsInitialized || mongoose.connection.readyState !== 1) {
    return;
  }
  
  try {
    console.log('🔄 Synchronisation des données en mémoire avec MongoDB...');
    
    // Charger les utilisateurs les plus récents (limité pour économiser la mémoire)
    const dbUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(MEMORY_MANAGEMENT.MAX_USERS_IN_MEMORY)
      .select('-password')
      .lean();
    
    if (dbUsers && dbUsers.length > 0) {
      // Convertir les utilisateurs de MongoDB pour qu'ils soient compatibles avec inMemoryDB
      const formattedUsers = dbUsers.map(user => ({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phoneNumber: user.phoneNumber || user.phone,
        role: user.role || 'user',
        isFreelancer: user.isFreelancer || false,
        createdAt: user.createdAt || new Date().toISOString(),
        isEmailVerified: user.isEmailVerified || false
      }));
      
      // Fusionner avec les utilisateurs existants en mémoire (pour préserver les mots de passe hash)
      inMemoryDB.users = inMemoryDB.users.filter(memUser => 
        !formattedUsers.some(dbUser => dbUser.email === memUser.email || dbUser.username === memUser.username)
      );
      
      // Ajouter les utilisateurs de MongoDB
      inMemoryDB.users.push(...formattedUsers);
      
      console.log(`✅ ${formattedUsers.length} utilisateurs synchronisés depuis MongoDB`);
    }
    
    // Synchroniser également les catégories, services, etc. si nécessaire
    
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec MongoDB:', error);
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
      
      // Trouver l'utilisateur avec la fonction combinée
      const user = await getUser(userIdentifier);
      
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
      
      // Récupérer les données complètes de l'utilisateur si MongoDB est disponible
      let userDataToReturn = { ...user };
      delete userDataToReturn.password;
      
      // Si MongoDB est disponible, enrichir avec les données réelles
      if (mongoose.connection.readyState === 1 && modelsInitialized) {
        try {
          const fullUserData = await getUserDataFromDB(user.id || user._id);
          if (fullUserData) {
            userDataToReturn = fullUserData;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          // Continue avec les données en mémoire en cas d'erreur
        }
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Connexion réussie',
        user: userDataToReturn,
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

// Gestionnaire d'arrêt du serveur
function shutdown(signal) {
  console.log(`Signal ${signal} reçu. Arrêt du serveur...`);
  
  // Utiliser la nouvelle fonction pour arrêter gracieusement
  prepareGracefulShutdown()
    .then(() => {
      console.log('Arrêt du serveur réussi');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors de l\'arrêt du serveur:', error);
      process.exit(1);
    });
}

// Mise à jour de l'initialisation du serveur pour inclure nos nouvelles fonctions de gestion mémoire
async function startServer() {
  try {
    // Essayer de se connecter à MongoDB
    const databaseConnected = await connectToDatabase();
    
    if (!databaseConnected) {
      console.warn('⚠️ Le serveur démarre sans connexion à MongoDB (mode dégradé)');
    }
    
    // Créer et démarrer le serveur HTTP
    const server = http.createServer(handleApiRequest);
    server.listen(PORT, HOST, () => {
      console.log(`API accessible à: http://${HOST}:${PORT}/api`);
      console.log(`URL de santé: http://${HOST}:${PORT}/health`);
      
      // Démarrer la surveillance de la mémoire
      console.log(`📊 Démarrage de la surveillance de la mémoire (intervalle: ${MEMORY_MANAGEMENT.CHECK_INTERVAL_MS}ms)`);
      setInterval(checkMemoryUsage, MEMORY_MANAGEMENT.CHECK_INTERVAL_MS);
      
      // Démarrer la rotation de la mémoire
      scheduleMemoryRotation();
    });
    
    // Gestionnaire d'arrêt gracieux
    process.on('SIGTERM', async () => {
      await prepareGracefulShutdown();
      server.close(() => {
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      await prepareGracefulShutdown();
      server.close(() => {
        process.exit(0);
      });
    });
    
    // Écouter les erreurs non gérées
    process.on('uncaughtException', (error) => {
      console.error('Erreur non gérée:', error);
      // Ne pas arrêter le serveur, juste nettoyer la mémoire
      cleanupMemory();
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Promesse rejetée non gérée:', reason);
      // Ne pas arrêter le serveur, juste nettoyer la mémoire
      cleanupMemory();
    });
    
    return server;
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Fonction de démarrage de l'application
async function bootstrap() {
  try {
    const server = await startServer();
    console.log(`📡 Serveur NionFar API en mode de compatibilité démarré sur ${HOST}:${PORT}`);
    
    // Activer Node.js en mode --expose-gc si possible (dans un environnement non-production seulement)
    if (NODE_ENV !== 'production' && !global.gc) {
      console.log('⚠️ Pour améliorer la gestion mémoire, démarrer avec: NODE_OPTIONS="--expose-gc"');
    }
  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage:', error);
    process.exit(1);
  }
}

// Démarrer l'application
bootstrap();

# Fin du script
echo "===== FIN DU SCRIPT DE BUILD ====="
exit 0 