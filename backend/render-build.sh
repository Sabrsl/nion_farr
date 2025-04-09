#!/bin/bash

# Navigation vers le dossier backend
echo "==== VÉRIFICATION DU RÉPERTOIRE COURANT ===="
pwd
ls -la

# Afficher les informations de l'environnement
echo "===== INFORMATIONS SYSTÈME ====="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "RENDER_INTERNAL_DIR: $RENDER_INTERNAL_DIR"
echo "RENDER_EXTERNAL_HOSTNAME: $RENDER_EXTERNAL_HOSTNAME"
echo "----------------------------"

# Vérifier le contenu du répertoire
echo "===== CONTENU DU RÉPERTOIRE AVANT INSTALLATION ====="
ls -la

# Installation des dépendances
echo "===== INSTALLATION DES DÉPENDANCES ====="
npm install --no-audit

# Vérifier que l'installation a réussi
if [ $? -ne 0 ]; then
  echo "ERREUR: L'installation des dépendances a échoué"
  exit 1
fi

# Afficher les dépendances installées
echo "===== DÉPENDANCES INSTALLÉES ====="
npm list --depth=0

# Construction de l'application
echo "===== CONSTRUCTION DE L'APPLICATION ====="
npm run build

# Vérifier que la construction a réussi
if [ $? -ne 0 ]; then
  echo "ERREUR: La construction de l'application a échoué"
  exit 1
fi

# Exécuter le script de vérification
echo "===== EXÉCUTION DU SCRIPT DE VÉRIFICATION ====="
node src/check-dist.js

# Vérifier le contenu du répertoire dist
echo "===== CONTENU DU RÉPERTOIRE DIST ====="
ls -la dist/

# Vérifier que le fichier main.js existe
if [ ! -f ./dist/main.js ]; then
  echo "ERREUR: Le fichier dist/main.js n'a pas été généré"
  echo "===== CONTENU DE LA RACINE DU PROJET ====="
  ls -la
  echo "===== CONTENU DU DOSSIER SRC ====="
  ls -la src/
  echo "===== CONTENU DU PACKAGE.JSON ====="
  cat package.json
  echo "===== CONTENU DU NEST-CLI.JSON ====="
  cat nest-cli.json
  exit 1
fi

echo "===== PERMISSIONS DES FICHIERS DIST ====="
chmod -R 755 dist/
ls -la dist/

# Copier le fichier main.js dans la racine du projet pour les tests
echo "===== COPIE DE MAIN.JS EN RACINE POUR TEST ====="
cp dist/main.js main.js
ls -la main.js

echo "===== CONSTRUCTION TERMINÉE AVEC SUCCÈS ====="
echo "Le fichier dist/main.js existe et est accessible"
exit 0 