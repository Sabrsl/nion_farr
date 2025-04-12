#!/bin/bash

# Script de build pour le déploiement Render

echo "🚀 Démarrage du script de build pour Render..."

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --no-audit --no-fund

# Installer cross-env globalement
echo "📦 Installation de cross-env..."
npm install -g cross-env rimraf

# Nettoyer le répertoire de build précédent
echo "🧹 Nettoyage du répertoire dist..."
rimraf dist

# Build de l'application
echo "🔨 Construction de l'application..."
NODE_OPTIONS="--max-old-space-size=4096" npx @nestjs/cli build

# Vérifier que le build s'est bien passé
if [ -d "dist" ] && [ -f "dist/src/main.js" ]; then
  echo "✅ Build réussi - L'application est prête à démarrer!"
else
  echo "❌ Le build a échoué - Vérifiez les logs pour plus d'informations"
  exit 1
fi

# Vérifier les variables d'environnement importantes
echo "🔍 Vérification des variables d'environnement..."
if [ -z "$MONGODB_URI" ]; then
  echo "⚠️ AVERTISSEMENT: MONGODB_URI n'est pas défini!"
fi

if [ -z "$PORT" ]; then
  echo "ℹ️ PORT n'est pas défini, utilisation du port par défaut (3001)"
fi

echo "📝 Configuration de l'environnement render..."
echo "IS_RENDER=true" > .env.render
echo "NODE_ENV=production" >> .env.render
echo "PORT=${PORT:-3001}" >> .env.render
echo "APP_URL=https://nionfar-backend.onrender.com" >> .env.render
echo "FRONTEND_URL=https://nion-farr.vercel.app" >> .env.render
echo "CORS_ALLOWED_ORIGINS=https://nion-farr.vercel.app,https://www.nion-farr.vercel.app,http://localhost:3000" >> .env.render

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

echo "🏁 Script de build terminé avec succès!"
exit 0 