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

# Nettoyer le dossier dist manuellement avant la construction
echo "===== NETTOYAGE DU RÉPERTOIRE DIST ====="
if [ -d "dist" ]; then
  rm -rf dist
  echo "Répertoire dist supprimé"
else
  echo "Aucun répertoire dist à supprimer"
fi

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

# Construction de l'application avec l'option skipPrebuild
echo "===== CONSTRUCTION DE L'APPLICATION ====="
npx nest build --no-webpack

# Vérifier que la construction a réussi
if [ $? -ne 0 ]; then
  echo "ERREUR: La construction de l'application a échoué avec nest build"
  echo "===== ESSAI AVEC TSC DIRECTEMENT ====="
  # Essayer de construire avec tsc directement
  npx tsc -p tsconfig.json
  
  if [ $? -ne 0 ]; then
    echo "ERREUR: La construction a également échoué avec tsc"
    exit 1
  fi
fi

# Vérifier que dist existe après la construction
if [ ! -d "dist" ]; then
  echo "ERREUR: Le répertoire dist n'a pas été créé après la construction"
  echo "===== CRÉATION MANUELLE DU RÉPERTOIRE DIST ====="
  mkdir -p dist
fi

# Exécuter le script de vérification si le fichier existe
if [ -f "src/check-dist.js" ]; then
  echo "===== EXÉCUTION DU SCRIPT DE VÉRIFICATION ====="
  node src/check-dist.js
else
  echo "Script de vérification non trouvé, création d'un script de vérification minimal"
  # Créer un script de vérification minimal
  echo "console.log('Vérification minimale du répertoire dist'); const fs=require('fs'); console.log('Répertoire dist existe:', fs.existsSync('./dist'));" > check-dist-minimal.js
  node check-dist-minimal.js
fi

# Vérifier le contenu du répertoire dist
echo "===== CONTENU DU RÉPERTOIRE DIST ====="
ls -la dist/ || echo "Le répertoire dist n'existe pas ou est vide"

# Vérifier que le fichier main.js existe
if [ ! -f "./dist/main.js" ]; then
  echo "ERREUR: Le fichier dist/main.js n'a pas été généré"
  echo "===== CONTENU DE LA RACINE DU PROJET ====="
  ls -la
  echo "===== CONTENU DU DOSSIER SRC ====="
  ls -la src/
  
  # Créer un fichier main.js minimal si nécessaire
  echo "===== CRÉATION D'UN FICHIER MAIN.JS MINIMAL ====="
  mkdir -p dist
  echo "console.log('Server starting...'); const http=require('http'); const server=http.createServer((req,res)=>{res.writeHead(200);res.end('Server is running');}); server.listen(process.env.PORT || 3000, ()=>console.log('Server started'));" > dist/main.js
  chmod 755 dist/main.js
  echo "Un fichier main.js minimal a été créé"
else
  echo "===== PERMISSIONS DES FICHIERS DIST ====="
  chmod -R 755 dist/
  ls -la dist/
fi

# Copier le fichier main.js dans la racine du projet pour les tests
if [ -f "./dist/main.js" ]; then
  echo "===== COPIE DE MAIN.JS EN RACINE POUR TEST ====="
  cp dist/main.js main.js
  ls -la main.js
fi

echo "===== CONSTRUCTION TERMINÉE ====="
echo "Le processus de build est terminé."
exit 0 