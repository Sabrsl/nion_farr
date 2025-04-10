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

# Exécuter un build complet avec plus de logs
RUN echo "🔨 Lancement du build..." && \
    npm run build --verbose && \
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

# Créer un script de démarrage amélioré
RUN echo '#!/bin/bash\n\
echo "🚀 Démarrage du serveur NionFar API..."\n\
echo "📝 Variables d'\''environnement configurées:"\n\
echo "- Frontend URL: $FRONTEND_URL"\n\
echo "- CORS autorisés: $CORS_ALLOWED_ORIGINS"\n\
echo "- Port: $PORT"\n\
echo "- Railway deployment: $RAILWAY_DEPLOYMENT"\n\
echo "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"\n\
echo "- JWT secrets configurés: $(if [ -n "$JWT_SECRET" ] && [ -n "$JWT_REFRESH_SECRET" ]; then echo "oui"; else echo "non"; fi)"\n\
\n\
echo "👉 Vérification du build..."\n\
echo "📂 Contenu du dossier dist/ :"\n\
ls -la dist/\n\
echo "📄 Vérification des fichiers critiques:"\n\
if [ -f "dist/main.js" ]; then\n\
  echo "✅ main.js présent, taille: $(stat -c %s dist/main.js) octets"\n\
  file dist/main.js\n\
else\n\
  echo "❌ main.js manquant! Tentative de reconstruction..."\n\
  npm run build\n\
  ls -la dist/\n\
fi\n\
\n\
echo "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"\n\
\n\
# Vérifier si PORT est vide ou non défini\n\
if [ -z "$PORT" ]; then\n\
  echo "⚠️ ATTENTION: La variable PORT n'est pas définie! Utilisation du port par défaut 3000."\n\
  export PORT=3000\n\
else\n\
  echo "✅ PORT est correctement défini à $PORT"\n\
fi\n\
\n\
echo "✅ Démarrage de l'\''application principale..."\n\
NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false MEMORY_OPTIMIZED=true PORT="$PORT" node dist/main.js 2>&1 | tee logs/app.log || (\n\
  echo "❌ Échec du démarrage de l'\''application principale, examen des logs..."\n\
  tail -n 50 logs/app.log\n\
  echo "🔄 Utilisation du serveur de secours pour maintenir les healthchecks"\n\
  echo "🔄 DIAGNOSTIC PORT pour serveur de secours: La variable PORT est définie à: $PORT"\n\
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" node server.js\n\
)' > start.sh && \
    chmod +x start.sh

# Créer script de secours start-railway.sh
COPY backend/start-railway.sh ./
RUN chmod +x start-railway.sh

# S'assurer que server-simple.js existe (sera créé par start-railway.sh si nécessaire)
COPY backend/server-simple.js ./
RUN chmod +x server-simple.js

# Exposer le port (Railway réaffecte PORT via la variable d'environnement)
EXPOSE 3000

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Script de démarrage avec gestion des échecs
CMD ["./start.sh"] 