#!/bin/bash

echo "🚀 Démarrage du serveur NionFar API..."
echo "📝 Variables d'environnement configurées:"
echo "- Frontend URL: $FRONTEND_URL"
echo "- CORS autorisés: $CORS_ALLOWED_ORIGINS"
echo "- Port: $PORT"
echo "- Railway deployment: $RAILWAY_DEPLOYMENT"
echo "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"

echo "📔 Exécution des scripts de correction critiques..."

# Script d'urgence pour créer l'entité User directement
if [ -f "scripts/create-user-entity.js" ]; then
  echo "🔧 Exécution du script d'urgence create-user-entity.js"
  node scripts/create-user-entity.js
  
  # Vérification de l'entité User
  if [ -f "scripts/verify-user-entity.js" ]; then
    echo "🔍 Vérification de l'entité User avec verify-user-entity.js"
    node scripts/verify-user-entity.js
  else
    echo "⚠️ Le script verify-user-entity.js n'a pas été trouvé"
  fi
else
  echo "⚠️ Le script create-user-entity.js n'a pas été trouvé"
fi

# Exécuter le script fix-entity-relations.js s'il existe
if [ -f "scripts/fix-entity-relations.js" ]; then
  echo "🔧 Exécution du script fix-entity-relations.js"
  node scripts/fix-entity-relations.js
else
  echo "⚠️ Le script fix-entity-relations.js n'a pas été trouvé"
fi

# Exécuter le script fix-missing-entities.js s'il existe
if [ -f "scripts/fix-missing-entities.js" ]; then
  echo "🔧 Exécution du script fix-missing-entities.js"
  node scripts/fix-missing-entities.js
else
  echo "⚠️ Le script fix-missing-entities.js n'a pas été trouvé"
fi

# Assurer que les dossiers d'entités existent
mkdir -p dist/modules/users/entities
mkdir -p dist/modules/auth/entities

# Vérifier des fichiers critiques
if [ ! -f "dist/modules/users/entities/user.entity.js" ]; then
  echo "⚠️ ATTENTION: user.entity.js est manquant - tentative de correction..."
  # Tenter la création une dernière fois avec le script d'urgence
  node scripts/create-user-entity.js
fi

# S'assurer que le fichier env.validation.js existe dans le répertoire dist
if [ ! -f "dist/env.validation.js" ]; then
  echo "⚠️ Le fichier env.validation.js est manquant dans dist, tentative de correction..."
  node scripts/fix-dist-structure.js
fi

# Exécuter le script fix-dist-structure.js pour corriger la structure du dossier dist
echo "🔧 Exécution du script fix-dist-structure.js"
node scripts/fix-dist-structure.js

# Exécution de prisma generate si nécessaire
if [ -f "prisma/schema.prisma" ]; then
  echo "🔧 Génération des clients Prisma..."
  npx prisma generate
fi

# Vérifier si le .env existe, sinon créer un .env minimal à partir des variables d'environnement
if [ ! -f ".env" ]; then
  echo "⚠️ Le fichier .env est manquant, création à partir des variables d'environnement..."
  echo "DATABASE_URL=$DATABASE_URL" > .env
  echo "PORT=$PORT" >> .env
  echo "JWT_SECRET=$JWT_SECRET" >> .env
fi

echo "👉 Création préventive des dossiers critiques..."
# Création des répertoires critiques
mkdir -p dist/common/logger
mkdir -p dist/common/interceptors
mkdir -p dist/modules/users
mkdir -p dist/modules/users/entities
mkdir -p dist/modules/auth/guards
mkdir -p dist/modules/auth/decorators
mkdir -p dist/modules/services
mkdir -p dist/modules/services/entities
mkdir -p dist/modules/orders
mkdir -p dist/modules/orders/entities
mkdir -p dist/modules/payments
mkdir -p dist/modules/messages
mkdir -p dist/modules/messages/entities
mkdir -p dist/modules/reviews
mkdir -p dist/modules/reviews/entities
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
  "dist/modules/users/entities/user.entity.js"
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
  
  # Exécuter à nouveau fix-entity-relations.js pour s'assurer que les entités sont créées
  if [ -f "scripts/fix-entity-relations.js" ]; then
    echo "🔄 Réexécution de fix-entity-relations.js..."
    node scripts/fix-entity-relations.js
  fi
  
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
    echo "⚠️ Démarrage du serveur de secours simplifié..."
    if [ -f "server-simple.js" ]; then
      echo "✅ Utilisation du serveur de secours server-simple.js"
      exec node server-simple.js
      exit 0
    elif [ -f "server.js" ]; then
      echo "✅ Utilisation du serveur de secours server.js"
      exec node server.js
      exit 0
    else
      echo "❌ ERREUR CRITIQUE: Aucun serveur de secours disponible!"
    fi
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

# Démarrer l'application avec un timeout et fallback
timeout 30s node dist/main.js || {
  echo "⚠️ L'application principale n'a pas démarré correctement dans les 30 secondes"
  echo "⚠️ Démarrage du serveur de secours..."
  
  if [ -f "server-simple.js" ]; then
    echo "✅ Utilisation du serveur de secours server-simple.js"
    exec node server-simple.js
  elif [ -f "server.js" ]; then
    echo "✅ Utilisation du serveur de secours server.js"
    exec node server.js
  else
    echo "❌ ERREUR CRITIQUE: Aucun serveur de secours disponible!"
    exit 1
  fi
} 