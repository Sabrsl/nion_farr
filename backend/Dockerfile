FROM node:18

WORKDIR /app

# Copier uniquement package.json, sans package-lock.json
COPY ./backend/package.json ./

# Installer les dépendances sans package-lock
RUN npm config set package-lock false && \
    npm install --legacy-peer-deps --no-audit

# Copier le reste des fichiers
COPY ./backend ./

# Supprimer le package-lock s'il existe
RUN rm -f package-lock.json || true

# Construire l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "start:railway"] 