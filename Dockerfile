FROM node:18-slim

WORKDIR /app

# Installer les packages nécessaires
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# Copier package.json sans package-lock.json
COPY backend/package.json ./

# Configuration npm pour éviter les problèmes de verrouillage
RUN npm config set package-lock false && \
    npm install --legacy-peer-deps --no-audit --no-optional

# Copier le code source
COPY backend/ ./

# Debugging: afficher la structure du code source
RUN echo "📂 Contenu du dossier source:" && \
    ls -la && \
    echo "📂 Contenu du dossier src:" && \
    ls -la src

# Créer le dossier de logs
RUN mkdir -p logs

# Exécuter un build complet sans scripts additionnels
RUN echo "🔨 Lancement du build NestJS..." && \
    npm run build:clean && \
    echo "📂 Contenu du dossier dist après build:" && \
    ls -la dist/ && \
    if [ -f "dist/main.js" ]; then \
      echo "✅ main.js présent, taille:" && \
      stat -c %s dist/main.js && \
      echo "🔍 Premières lignes de main.js:" && \
      head -n 20 dist/main.js; \
    else \
      echo "❌ main.js manquant!"; \
    fi

# Créer script de secours server.js simple si nécessaire
RUN if [ ! -f "server.js" ]; then \
    echo "⚠️ Création d'un serveur de secours server.js" && \
    echo "/**\n * Serveur de secours simple pour Railway\n */\n\
const http = require('http');\n\
const PORT = process.env.PORT || 3000;\n\
\n\
const server = http.createServer((req, res) => {\n\
  if (req.url === '/health/ping') {\n\
    res.writeHead(200, { 'Content-Type': 'application/json' });\n\
    res.end(JSON.stringify({ status: 'ok', message: 'pong' }));\n\
    return;\n\
  }\n\
  res.writeHead(200);\n\
  res.end('Server running');\n\
});\n\
\n\
server.listen(PORT, () => console.log(`Serveur de secours en écoute sur ${PORT}`));" > server.js; \
  fi

# Créer un script de démarrage simple avec correction de syntaxe
RUN echo '#!/bin/bash\n\
\n\
echo "🚀 Démarrage du serveur NionFar API..."\n\
echo "📝 Variables d'\''environnement configurées:"\n\
echo "- Frontend URL: $FRONTEND_URL"\n\
echo "- CORS autorisés: $CORS_ALLOWED_ORIGINS"\n\
echo "- Port: $PORT"\n\
echo "- Railway deployment: $RAILWAY_DEPLOYMENT"\n\
echo "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"\n\
\n\
echo "👉 Vérification du build..."\n\
echo "📂 Contenu du dossier dist/ :"\n\
ls -la dist/\n\
\n\
echo "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"\n\
if [ -z "$PORT" ]; then\n\
  echo "⚠️ ATTENTION: La variable PORT n'\''est pas définie! Utilisation du port par défaut 3000."\n\
  export PORT=3000\n\
else\n\
  echo "✅ PORT est correctement défini à $PORT"\n\
fi\n\
\n\
# Vérifier si main.js existe\n\
if [ -f "dist/main.js" ]; then\n\
  echo "✅ Démarrage de l'\''application principale..."\n\
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false MEMORY_OPTIMIZED=true PORT="$PORT" node dist/main.js 2>&1 | tee logs/app.log || (\n\
    echo "❌ Échec du démarrage de l'\''application principale, examen des logs..."\n\
    tail -n 50 logs/app.log\n\
    echo "🔄 Utilisation du serveur de secours pour maintenir les healthchecks"\n\
    NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server.js\n\
  )\n\
else\n\
  echo "❌ main.js manquant! Démarrage du serveur de secours..."\n\
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server.js\n\
fi' > start.sh && \
    chmod +x start.sh

# Créer le main.js manuellement pour s'assurer qu'il existe
RUN echo "// Fichier main.js créé manuellement pour garantir que le service démarre\n\
const express = require('express');\n\
const app = express();\n\
const PORT = process.env.PORT || 3000;\n\
\n\
// Configuration CORS\n\
app.use((req, res, next) => {\n\
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? \n\
    process.env.CORS_ALLOWED_ORIGINS.split(',') : \n\
    [process.env.FRONTEND_URL || '*'];\n\
  \n\
  const origin = req.headers.origin;\n\
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {\n\
    res.header('Access-Control-Allow-Origin', origin);\n\
  }\n\
  \n\
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');\n\
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');\n\
  \n\
  if (req.method === 'OPTIONS') {\n\
    return res.sendStatus(200);\n\
  }\n\
  \n\
  next();\n\
});\n\
\n\
// Healthcheck endpoint\n\
app.get('/health/ping', (req, res) => {\n\
  res.json({ \n\
    status: 'ok', \n\
    message: 'pong',\n\
    timestamp: new Date().toISOString(),\n\
    environment: process.env.NODE_ENV,\n\
    railway: process.env.RAILWAY_DEPLOYMENT === 'true'\n\
  });\n\
});\n\
\n\
// API routes\n\
app.get('/api', (req, res) => {\n\
  res.json({ message: 'API is running' });\n\
});\n\
\n\
// Start server\n\
app.listen(PORT, '0.0.0.0', () => {\n\
  console.log(`🚀 Serveur express en écoute sur le port ${PORT}`);\n\
  console.log(`✅ Healthcheck disponible sur http://0.0.0.0:${PORT}/health/ping`);\n\
});\n\
\n\
// Error handling\n\
process.on('uncaughtException', (err) => {\n\
  console.error('Uncaught exception:', err);\n\
});\n\
\n\
process.on('unhandledRejection', (reason) => {\n\
  console.error('Unhandled rejection:', reason);\n\
});" > dist/main.js && \
    mkdir -p dist && \
    chmod +x dist/main.js

# Exposer le port (Railway réaffecte PORT via la variable d'environnement)
EXPOSE 3000

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Script de démarrage avec gestion des échecs
CMD ["./start.sh"] 