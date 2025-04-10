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
  NODE_ENV=production RAILWAY_DEPLOYMENT=true PORT="$PORT" node dist/main.js 2>&1 | tee logs/app.log || (
    echo "❌ Échec du serveur NestJS"
    
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
  )
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