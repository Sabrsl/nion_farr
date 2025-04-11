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

# S'assurer que glob est installé pour le script de correction des structures
RUN npm install glob --save

# Copier le reste du code source
COPY . .

# Créer le dossier de logs
RUN mkdir -p logs

# Construire l'application
RUN echo "🔨 Lancement du build NestJS..." && \
    npm run build:railway && \
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

# Rendre le script de démarrage exécutable
RUN chmod +x ./start-railway.sh

# Exposer les ports (Railway réaffecte PORT via la variable d'environnement)
EXPOSE 3000 8080

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Commande de démarrage
CMD ["./start-railway.sh"] 