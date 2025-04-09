#!/usr/bin/env bash
# Exit on error
set -e

# Installation des dépendances
npm install

# Construction de l'application
npm run build

echo "Build completed successfully!" 