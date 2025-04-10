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

# Créer le dossier de logs
RUN mkdir -p logs

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
if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then\n\
  echo "❌ Fichiers de build manquants, tentative de reconstruction..."\n\
  npm run build\n\
fi\n\
\n\
echo "📁 Contenu du dossier dist/ :"\n\
ls -la dist/\n\
echo "📄 Vérification des fichiers critiques:"\n\
file dist/main.js\n\
\n\
echo "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"\n\
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

# Construire l'application
RUN npm run build && \
    ls -la dist/

# Exposer le port (Railway réaffecte PORT via la variable d'environnement)
EXPOSE 3000

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Script de démarrage avec gestion des échecs
CMD ["./start.sh"] 