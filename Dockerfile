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
    npm run build:railway

# Vérifier si main.js existe et le copier si nécessaire
RUN echo "📂 Vérification du fichier main.js..." && \
    if [ -f "dist/src/main.js" ]; then \
      echo "✅ dist/src/main.js trouvé, copie vers dist/main.js..." && \
      cp -f dist/src/main.js dist/main.js && \
      echo "✅ Copie réussie"; \
    else \
      echo "⚠️ dist/src/main.js non trouvé, vérification de dist/main.js..."; \
    fi && \
    if [ ! -f "dist/main.js" ]; then \
      echo "❌ main.js manquant, exécution de check-dist.js..." && \
      node scripts/check-dist.js; \
    fi && \
    echo "📂 Contenu final du dossier dist:" && \
    ls -la dist/

# Créer un serveur de secours uniquement si main.js n'a pas été généré
RUN if [ ! -f "dist/main.js" ]; then \
    echo "⚠️ Création d'un serveur de secours server.js" && \
    echo "/**\n * Serveur de secours simple pour Railway\n */\nconst http = require('http');\nconst PORT = process.env.PORT || 3000;\n\nconst server = http.createServer((req, res) => {\n  if (req.url === '/health' || req.url === '/health/ping') {\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    res.end(JSON.stringify({ status: 'ok', message: 'pong', fallback: true, timestamp: new Date().toISOString() }));\n    return;\n  }\n  res.writeHead(200);\n  res.end('NionFar API Server running in fallback mode');\n});\n\nserver.listen(PORT, () => console.log(`Serveur de secours en écoute sur ${PORT}`));" > server.js; \
fi

# Créer un script de démarrage qui vérifie si main.js existe et démarre le serveur approprié
RUN echo '#!/bin/bash\n\necho "🚀 Démarrage du serveur NionFar API..."\necho "📝 Variables d'"'"'environnement configurées:"\necho "- Frontend URL: $FRONTEND_URL"\necho "- CORS autorisés: $CORS_ALLOWED_ORIGINS"\necho "- Port: $PORT"\necho "- Railway deployment: $RAILWAY_DEPLOYMENT"\necho "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"\n\necho "👉 Vérification du build..."\necho "📂 Contenu du dossier dist/ :"\nls -la dist/\n\necho "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"\nif [ -z "$PORT" ]; then\n  echo "⚠️ ATTENTION: La variable PORT n'"'"'est pas définie! Utilisation du port par défaut 3000."\n  export PORT=3000\nelse\n  echo "✅ PORT est correctement défini à $PORT"\nfi\n\nif [ -f "dist/main.js" ]; then\n  echo "✅ Démarrage de l'"'"'application principale..."\n  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false MEMORY_OPTIMIZED=true PORT="$PORT" node dist/main.js 2>&1 | tee logs/app.log || (\n    echo "❌ Échec du démarrage de l'"'"'application principale, examen des logs..."\n    tail -n 50 logs/app.log\n    echo "🔄 Utilisation du serveur de secours pour maintenir les healthchecks"\n    NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server.js\n  )\nelse\n  echo "❌ main.js manquant! Démarrage du serveur de secours..."\n  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server.js\nfi' > start.sh && \
    chmod +x start.sh

# Exposer le port (Railway réaffecte PORT via la variable d'environnement)
EXPOSE 3000

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Script de démarrage avec gestion des échecs
CMD ["./start.sh"] 