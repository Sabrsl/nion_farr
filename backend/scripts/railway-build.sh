#!/bin/bash

echo "🚀 Démarrage du script de build Railway personnalisé"

# Vérification et nettoyage des fichiers problématiques
echo "🧹 Nettoyage des fichiers lock s'ils existent"
if [ -f "package-lock.json" ]; then
  echo "  - Suppression du package-lock.json"
  rm -f package-lock.json
fi

# Installation des dépendances avec npm install (pas npm ci)
echo "📦 Installation des dépendances avec npm install"
npm install --legacy-peer-deps --no-audit

# Vérification de l'installation
if [ $? -ne 0 ]; then
  echo "❌ Erreur lors de l'installation des dépendances!"
  exit 1
fi

# Construction du projet
echo "🔨 Build du projet"
npm run build

# Vérification du build
if [ $? -ne 0 ] || [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
  echo "❌ Échec du build! Le dossier dist ou main.js est manquant."
  exit 1
fi

echo "✅ Build terminé avec succès!"
exit 0 