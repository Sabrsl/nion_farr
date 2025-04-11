#!/bin/bash

echo "🚀 Démarrage du serveur NionFar API..."
echo "📝 Variables d'environnement configurées:"
echo "- Frontend URL: $FRONTEND_URL"
echo "- CORS autorisés: $CORS_ALLOWED_ORIGINS"
echo "- Port: $PORT"
echo "- Railway deployment: $RAILWAY_DEPLOYMENT"
echo "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"

echo "👉 Vérification du build..."
echo "📂 Contenu du dossier dist/ :"
ls -la dist/

# Vérifier si le serveur principal existe
if [ ! -f "dist/main.js" ] && [ -f "dist/src/main.js" ]; then
  echo "📦 main.js trouvé dans dist/src/, copie vers dist/"
  cp dist/src/main.js dist/main.js
fi

# Vérification du port
echo "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"
if [ -z "$PORT" ]; then
  echo "⚠️ ATTENTION: La variable PORT n'est pas définie! Utilisation du port par défaut 3000."
  export PORT=3000
else
  echo "✅ PORT est correctement défini à $PORT"
fi

# Assurer que les logs existent
mkdir -p logs

# Correction des imports avant le démarrage
if [ -f "scripts/fix-imports.js" ]; then
  echo "🔧 Correction des importations pour assurer la compatibilité..."
  node scripts/fix-imports.js
else
  echo "⚠️ Script de correction des importations non trouvé."
fi

# Options de performance
export NODE_OPTIONS="--max-old-space-size=512 --enable-source-maps"

# Démarrage avec différentes stratégies de repli
if [ -f "dist/main.js" ]; then
  echo "✅ Démarrage de l'application principale avec reflect-metadata préchargé..."
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" \
    node -r reflect-metadata dist/main.js 2>&1 | tee logs/app.log
elif [ -f "main-railway.js" ]; then
  echo "✅ Utilisation du script main-railway.js..."
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" \
    node -r reflect-metadata main-railway.js 2>&1 | tee logs/app.log
elif [ -f "server.js" ]; then
  echo "⚠️ Utilisation du serveur de secours..."
  NODE_ENV=production RAILWAY_DEPLOYMENT=true IS_RENDER=false PORT="$PORT" \
    node server.js 2>&1 | tee logs/fallback.log
else
  echo "❌ ERREUR CRITIQUE: Aucun point d'entrée valide trouvé!"
  exit 1
fi 