FROM node:18

WORKDIR /app

# Copiez d'abord les fichiers package pour meilleur caching
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers
COPY . .

# Compilez l'application
RUN npm run build

# Nettoyez les dépendances de développement si nécessaire
# RUN npm prune --production

# Exposez le port que l'application utilisera
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "run", "start:railway"] 