FROM node:18

WORKDIR /app

# Copier package.json sans package-lock.json
COPY backend/package.json ./

# Configuration npm pour éviter les problèmes de verrouillage
RUN npm config set package-lock false && \
    npm install --legacy-peer-deps --no-audit --no-optional

# Copier le code source
COPY backend/ ./

# Supprimer package-lock s'il existe encore
RUN rm -f package-lock.json || true

# Construire l'application
RUN npm run build

# S'assurer que les dossiers importants existent
RUN ls -la && ls -la dist/ || true

# Exposer le port (Railway réaffecte PORT via la variable d'environnement)
EXPOSE 3000

# Commande de démarrage adaptée à Railway
CMD ["npm", "run", "start:railway"] 