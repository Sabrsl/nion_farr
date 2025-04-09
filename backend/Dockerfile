FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port 3001
EXPOSE 3001

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "start:dev"]

# Pour la production, remplacer la commande par:
# RUN npm run build
# CMD ["npm", "run", "start:prod"] 