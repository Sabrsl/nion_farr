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

# Créer un script de démarrage avec fallback
RUN echo '#!/bin/bash\n\
echo "🚀 Démarrage du serveur NionFar API..."\n\
echo "Frontend URL configuré: $FRONTEND_URL"\n\
echo "CORS autorisés: $CORS_ALLOWED_ORIGINS"\n\
NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false MEMORY_OPTIMIZED=true node dist/main.js || (\n\
  echo "❌ Échec du démarrage de l'\''application principale, utilisation du serveur de secours"\n\
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false node server.js\n\
)' > start.sh && \
    chmod +x start.sh && \
    ls -la && \
    npm run build && \
    ls -la dist/

# Exposer le port (Railway réaffecte PORT via la variable d'environnement)
EXPOSE 3000

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Script de démarrage avec gestion des échecs
CMD ["./start.sh"] 