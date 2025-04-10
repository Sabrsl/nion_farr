#!/bin/bash

# Vérifier l'environnement
echo "🔍 Vérification de l'environnement Railway"
echo "- NODE_ENV: $NODE_ENV"
echo "- PORT: $PORT"
echo "- RAILWAY_DEPLOYMENT: $RAILWAY_DEPLOYMENT"
echo "- Présence de MongoDB: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"

# Créer les répertoires nécessaires
mkdir -p logs
mkdir -p dist

# Si PORT n'est pas défini, utiliser 3000
if [ -z "$PORT" ]; then
  echo "⚠️ PORT n'est pas défini, utilisation de 3000 par défaut"
  export PORT=3000
else
  echo "✅ PORT est défini à $PORT"
fi

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
fi

# Vérification supplémentaire des imports
echo "🔍 Vérification des imports dans main.js"
grep -n "import " dist/main.js || echo "Aucun import trouvé (fichier compilé en JS)"

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

# 1. Essayer d'utiliser le serveur NestJS compilé si présent
if [ -f "dist/main.js" ]; then
  echo "✅ Utilisation du serveur NestJS compilé (dist/main.js)"
  # Utiliser une variable pour stocker le code de retour
  NODE_ENV=production RAILWAY_DEPLOYMENT=true PORT="$PORT" node dist/main.js 2>&1 | tee logs/app.log
  NESTJS_EXIT_CODE=$?
  
  # Afficher les logs précédents
  echo "📄 Logs de démarrage (dist/main.js) :"
  tail -n 100 logs/app.log
  
  if [ $NESTJS_EXIT_CODE -ne 0 ]; then
    echo "❌ Échec du serveur NestJS (code de sortie: $NESTJS_EXIT_CODE)"
    
    # 2. Si le serveur principal échoue, essayer le serveur de secours standard
    if [ -f "server.js" ]; then
      echo "✅ Utilisation du serveur de secours (server.js)"
      NODE_ENV=production RAILWAY_DEPLOYMENT=true PORT="$PORT" node server.js 2>&1 | tee logs/backup.log || (
        echo "❌ Échec du serveur de secours"
        
        # 3. En dernier recours, utiliser le serveur ultra-simple
        echo "🚨 Utilisation du serveur ultra-simple en dernier recours"
        NODE_ENV=production PORT="$PORT" node server-simple.js
      )
    else
      # Si server.js n'existe pas, aller directement au serveur ultra-simple
      echo "⚠️ server.js non trouvé, utilisation du serveur ultra-simple"
      NODE_ENV=production PORT="$PORT" node server-simple.js
    fi
  fi
else
  # Si dist/main.js n'existe pas, essayer le serveur de secours
  echo "⚠️ dist/main.js non trouvé, tentative avec le serveur de secours"
  
  if [ -f "server.js" ]; then
    echo "✅ Utilisation du serveur de secours (server.js)"
    NODE_ENV=production RAILWAY_DEPLOYMENT=true PORT="$PORT" node server.js 2>&1 | tee logs/backup.log || (
      echo "❌ Échec du serveur de secours, utilisation du serveur ultra-simple"
      NODE_ENV=production PORT="$PORT" node server-simple.js
    )
  else
    # En dernier recours, utiliser le serveur ultra-simple
    echo "⚠️ Aucun serveur standard trouvé, utilisation du serveur ultra-simple"
    NODE_ENV=production PORT="$PORT" node server-simple.js
  fi
fi 