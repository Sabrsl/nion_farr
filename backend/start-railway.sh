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

# Vérification et correction du problème app.service.js
if [ ! -f "dist/app.service.js" ] || grep -q "require('./app.service')" "dist/app.controller.js"; then
  echo "🔧 Correction du problème app.service.js..."
  if [ -f "scripts/fix-dist-structure.js" ]; then
    node scripts/fix-dist-structure.js
    echo "✅ Script de correction exécuté"
  else
    echo "⚠️ Script de correction non trouvé, création manuelle de app.service.js..."
    if [ ! -f "dist/app.service.js" ]; then
      cat > dist/app.service.js << EOL
require('reflect-metadata');
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");

let AppService = class AppService {
    constructor() {
        console.log('AppService initialized');
    }
    
    getHello() {
        return 'NionFar API is running!';
    }
};
AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
exports.AppService = AppService;
EOL
      echo "✅ Fichier app.service.js créé manuellement"
    fi
    
    # Corriger les imports dans app.controller.js si nécessaire
    if [ -f "dist/app.controller.js" ]; then
      sed -i 's/require(.\/app.service)/require(.\/app.service.js)/g' dist/app.controller.js
      echo "✅ Imports corrigés dans app.controller.js"
    fi
  fi
fi

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

# Correction de la structure dist avant le démarrage
if [ -f "scripts/fix-dist-structure.js" ]; then
  echo "🔧 Correction de la structure dist pour assurer la compatibilité..."
  node scripts/fix-dist-structure.js
else
  echo "⚠️ Script de correction de la structure dist non trouvé."
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