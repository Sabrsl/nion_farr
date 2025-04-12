#!/bin/bash

echo "🚀 Démarrage du serveur NionFar API..."
echo "📝 Variables d'environnement configurées:"
echo "- Frontend URL: $FRONTEND_URL"
echo "- CORS autorisés: $CORS_ALLOWED_ORIGINS"
echo "- Port: $PORT"
echo "- Railway deployment: $RAILWAY_DEPLOYMENT"
echo "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"

echo "👉 Création préventive des dossiers critiques..."
# Création des répertoires critiques
mkdir -p dist/common/logger
mkdir -p dist/common/interceptors
mkdir -p dist/modules/users
mkdir -p dist/modules/auth/guards
mkdir -p dist/modules/auth/decorators
mkdir -p dist/modules/services
mkdir -p dist/modules/orders
mkdir -p dist/modules/payments
mkdir -p dist/modules/messages
mkdir -p dist/modules/reviews
mkdir -p dist/modules/admin
mkdir -p dist/modules/notifications
mkdir -p dist/modules/email
mkdir -p dist/modules/sms
mkdir -p dist/modules/disputes
mkdir -p dist/security
mkdir -p dist/ip
mkdir -p dist/performance
mkdir -p logs

echo "👉 Vérification des fichiers critiques..."
# Liste des fichiers critiques à vérifier
CRITICAL_FILES=(
  "dist/main.js"
  "dist/app.module.js"
  "dist/app.service.js"
  "dist/app.controller.js"
  "dist/common/logger/logger.module.js"
  "dist/common/interceptors/http-exception.interceptor.js"
  "dist/modules/users/users.module.js"
)

# Vérifier chaque fichier critique
MISSING_FILES=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file existe"
  else
    echo "❌ $file manquant!"
    MISSING_FILES=$((MISSING_FILES+1))
  fi
done

# Si des fichiers sont manquants, exécuter le script de correction
if [ $MISSING_FILES -gt 0 ]; then
  echo "🔄 Fichiers manquants détectés, exécution du script de correction..."
  node scripts/fix-dist-structure.js
  
  # Vérifier à nouveau les fichiers critiques
  MISSING_FILES_AFTER=0
  for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
      echo "✅ $file existe maintenant"
    else
      echo "❌ $file toujours manquant!"
      MISSING_FILES_AFTER=$((MISSING_FILES_AFTER+1))
    fi
  done
  
  if [ $MISSING_FILES_AFTER -gt 0 ]; then
    echo "❌ ERREUR: Des fichiers critiques sont toujours manquants après correction!"
  else
    echo "✅ Tous les fichiers critiques sont désormais présents"
  fi
else
  echo "✅ Tous les fichiers critiques sont présents"
fi

echo "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"

if [ -z "$PORT" ]; then
  echo "⚠️ PORT non défini, utilisation de la valeur par défaut 8080"
  export PORT=8080
fi

echo "✅ PORT est correctement défini à $PORT"

echo "✅ Démarrage de l'application principale..."

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

# Démarrer l'application
node dist/main.js 