# Dockerfile pour NionFar API
FROM node:18-slim

# Utiliser dumb-init comme init system
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package.json et installer les dépendances
COPY package.json ./
RUN npm config set package-lock false && \
    npm install --legacy-peer-deps --no-audit --no-optional

# S'assurer que les dépendances nécessaires sont installées
RUN npm install glob prom-client serverless-http --save

# Copier le reste du code source
COPY . .

# Créer le dossier de logs
RUN mkdir -p logs

# Exécuter un build complet
RUN echo "🔨 Lancement du build NestJS..." && \
    npm run build && \
    echo "📋 Structure finale de dist/:" && \
    ls -la dist/ && \
    if [ -f "dist/main.js" ]; then \
      echo "✅ main.js trouvé à la racine de dist/:" && \
      stat -c %s dist/main.js; \
    else \
      echo "❌ main.js manquant! Application de fix-dist-structure.js..." && \
      node scripts/fix-dist-structure.js && \
      if [ ! -f "dist/main.js" ]; then \
        echo "❌ Échec de la correction! Impossible de continuer."; \
        exit 1; \
      fi; \
    fi

# S'assurer que reflect-metadata est correctement chargé
RUN echo '#!/bin/bash\n\necho "🧩 Vérification de reflect-metadata..."\nnode -e "try { require(\"reflect-metadata\"); console.log(\"✅ reflect-metadata chargé avec succès.\"); } catch(e) { console.error(\"❌ Erreur lors du chargement de reflect-metadata:\", e); process.exit(1); }"' > check-reflect.sh && \
    chmod +x check-reflect.sh && \
    ./check-reflect.sh

# Créer le script de démarrage
RUN echo '#!/bin/bash\n\necho "🚀 Démarrage de NionFar API..."\n\n# Vérification de Vercel\nVERCEL=${VERCEL:-0}\nPORT=${PORT:-3000}\n\necho "📋 Configuration:"\necho "- Node.js $(node -v)"\necho "- NPM $(npm -v)"\necho "- Environment: $NODE_ENV"\necho "- Port: $PORT"\necho "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"\n\necho "👉 Vérification du build..."\necho "📂 Contenu du dossier dist/ :"\nls -la dist/\n\nif [ -f "dist/main.js" ]; then\n  echo "✅ main.js trouvé, démarrage de l\'"'"'application principale..."\n  NODE_ENV=production VERCEL=1 MEMORY_OPTIMIZED=true PORT="$PORT" node dist/main.js 2>&1 | tee logs/app.log || (\n    echo "❌ Échec du démarrage de l\'"'"'application principale, examen des logs précédents"\n    echo "🚨 Démarrage du serveur minimal pour les healthchecks"\n    NODE_ENV=production VERCEL=1 PORT="$PORT" node server.js\n  )\nelse\n  echo "❌ main.js manquant! Démarrage du serveur de secours..."\n  NODE_ENV=production VERCEL=1 PORT="$PORT" node server.js\nfi' > start.sh && \
    chmod +x ./start.sh

# Exposer les ports (Vercel et autres plates-formes réaffectent PORT via la variable d'environnement)
EXPOSE 3000 8080

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Commande de démarrage
CMD ["./start.sh"] 