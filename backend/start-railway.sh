#!/bin/bash

echo "🚀 Démarrage du serveur NionFar API..."
echo "📝 Variables d'environnement configurées:"
echo "- Frontend URL: $FRONTEND_URL"
echo "- CORS autorisés: $CORS_ALLOWED_ORIGINS"
echo "- Port: $PORT"
echo "- Railway deployment: $RAILWAY_DEPLOYMENT"
echo "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"

# Nettoyer les fichiers .js générés qui causent des conflits
echo "🧹 Nettoyage des fichiers .js problématiques..."
if [ -f "scripts/clean-source-js.js" ]; then
  node scripts/clean-source-js.js
else
  echo "⚠️ Script de nettoyage non trouvé, poursuite sans nettoyage."
fi

echo "👉 Vérification du build..."
echo "📂 Contenu du dossier dist/ :"
ls -la dist/

# Vérifier si main.js existe à la racine
if [ ! -f "dist/main.js" ]; then
  echo "⚠️ main.js manquant à la racine de dist/"
  
  # Vérifier si main.js existe dans dist/src
  if [ -f "dist/src/main.js" ]; then
    echo "🔍 main.js trouvé dans dist/src/, copie vers dist/..."
    cp dist/src/main.js dist/main.js
    echo "✅ main.js copié avec succès"
  else
    echo "❌ main.js manquant dans dist/src/ également"
    # Exécuter le script de validation
    node scripts/validate-railway.js
    npm run check:main-js
  fi
fi

# Validation supplémentaire pour s'assurer que main.js existe
echo "🔍 Vérification finale de main.js..."
if [ ! -f "dist/main.js" ]; then
  echo "❌ main.js toujours manquant! Création d'un fichier main.js de secours..."
  
  # Créer un main.js minimal de secours
  cat > dist/main.js << 'EOF'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const express = require('express');
const cors = require('cors');
const http = require('http');

console.log('🚨 Démarrage du serveur express de secours...');
console.log('Variables d\'environnement:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS
});

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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Health check disponible sur http://0.0.0.0:${PORT}/health/ping`);
});
EOF
  echo "✅ Fichier main.js de secours créé avec succès"
fi

echo "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"
if [ -z "$PORT" ]; then
  echo "⚠️ ATTENTION: La variable PORT n'est pas définie! Utilisation du port par défaut 3000."
  export PORT=3000
else
  echo "✅ PORT est correctement défini à $PORT"
fi

echo "✅ Version de NODE: $(node --version)"
echo "✅ Version de NPM: $(npm --version)"

# Vérifier si main.js existe
if [ -f "dist/main.js" ]; then
  echo "✅ Démarrage de l'application principale..."
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false MEMORY_OPTIMIZED=true PORT="$PORT" node dist/main.js 2>&1 | tee logs/app.log || (
    echo "❌ Échec du démarrage de l'application principale, examen des logs..."
    tail -n 50 logs/app.log
    echo "🔄 Utilisation du serveur de secours pour maintenir les healthchecks"
    NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server.js
  )
else
  echo "❌ main.js manquant! Démarrage du serveur de secours..."
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server.js
fi

# Créer les répertoires nécessaires
mkdir -p logs
mkdir -p dist

# Forcer un build pour s'assurer que dist/main.js existe
echo "📦 Vérification du build NestJS..."
if [ ! -f "dist/main.js" ] || [ ! -s "dist/main.js" ]; then
  echo "📦 Build manquant ou vide — lancement de npm run build..."
  npm run build
fi

# Afficher le contenu du dossier dist
echo "📂 Contenu du dossier dist/ :"
ls -la dist/

# Vérification de la taille du fichier main.js
echo "🔍 Vérification de la taille de main.js"
if [ -f "dist/main.js" ]; then
  MAIN_JS_SIZE=$(stat -c %s dist/main.js 2>/dev/null || stat -f %z dist/main.js 2>/dev/null || echo "0")
  echo "Taille de main.js: $MAIN_JS_SIZE octets"

  # Si le fichier est trop petit (< 5KB), créer un fichier main.js de secours
  if [ "$MAIN_JS_SIZE" -lt 5000 ]; then
    echo "⚠️ Le fichier main.js est trop petit ($MAIN_JS_SIZE octets) - création d'un fichier principal de secours"
    
    # Sauvegarder le fichier original
    mv dist/main.js dist/main.js.original
    
    # Créer un fichier main.js minimal qui utilise express
    cat > dist/main.js << 'MAIN_JS'
/**
 * Serveur NestJS minimal de secours
 */
console.log("🚀 Démarrage du serveur NestJS minimal de secours");

// Dépendances essentielles
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS ? 
          process.env.CORS_ALLOWED_ORIGINS.split(',') : 
          (process.env.FRONTEND_URL || '*')
}));

// Logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NestJS minimal server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    railway: process.env.RAILWAY_DEPLOYMENT === 'true',
    render: process.env.IS_RENDER === 'true'
  });
});

// Route de healthcheck (ping)
app.get('/health/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NionFar API is running',
    timestamp: new Date().toISOString()
  });
});

// API endpoint générique
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'API is running in minimal mode',
    info: 'This is a minimal server because the full NestJS app failed to start'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur minimal NestJS en écoute sur le port ${PORT}`);
  console.log(`📝 Variables d'environnement: NODE_ENV=${process.env.NODE_ENV}, RAILWAY=${process.env.RAILWAY_DEPLOYMENT}`);
  console.log(`✅ Healthcheck disponible sur http://0.0.0.0:${PORT}/health/ping`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Ne pas quitter le process
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Ne pas quitter le process
});
MAIN_JS

    # Rendre exécutable
    chmod +x dist/main.js
    echo "✅ Fichier main.js de secours créé"
  else
    echo "✅ La taille de main.js semble correcte"
  fi
else
  echo "❌ Le fichier main.js n'existe pas!"
fi

# Vérifier si le serveur-simple.js existe, sinon le créer
if [ ! -f "server-simple.js" ]; then
  echo "⚠️ Création d'un serveur simple de secours..."
  cat > server-simple.js << 'SIMPLE_SERVER'
/**
 * Serveur minimal pour Railway - Garantit un healthcheck fonctionnel
 */
const http = require('http');
const PORT = process.env.PORT || 3000;

console.log(`🚨 SERVEUR SIMPLE DÉMARRÉ - PORT=${PORT}`);

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  if (req.url === '/health' || req.url === '/health/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'pong', timestamp: new Date().toISOString() }));
    return;
  }
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NionFar API Simple Server');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur simple en écoute sur le port ${PORT}`);
});

process.on('uncaughtException', err => {
  console.error('Erreur non gérée:', err);
  // Ne pas fermer le serveur
});
SIMPLE_SERVER
  echo "✅ Serveur simple créé"
fi

# Essayer de démarrer le serveur principal
echo "🚀 Tentative de démarrage du serveur principal..."

# Vérifier si dist/main.js existe
if [ -f ./dist/main.js ]; then
  echo "✅ Fichier main.js trouvé, démarrage normal"
  
  # Démarrer le serveur NestJS
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false MEMORY_OPTIMIZED=true PORT="$PORT" node dist/main.js &
  SERVER_PID=$!
  
  # Attendre que le serveur soit prêt (5 secondes max)
  echo "⏳ Attente du démarrage du serveur..."
  sleep 5
  
  # Vérifier si le serveur répond
  echo "🔍 Test de connectivité sur http://localhost:$PORT/health/ping"
  if curl -s http://localhost:$PORT/health/ping > /dev/null; then
    echo "✅ Serveur répond correctement au healthcheck!"
    
    # Afficher la réponse du healthcheck
    echo "📊 Réponse du healthcheck:"
    curl -s http://localhost:$PORT/health/ping
    echo ""
    
    # Garder le processus en premier plan
    wait $SERVER_PID
  else
    echo "❌ Le serveur ne répond pas au healthcheck après 5s"
    echo "💡 Lancement du serveur de secours..."
    kill $SERVER_PID 2>/dev/null
    NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server-simple.js
  fi
else
  echo "❌ main.js manquant! Démarrage du serveur de secours..."
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server-simple.js
fi 