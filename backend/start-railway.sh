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

# Vérification plus robuste et création forcée du fichier app.service.js
echo "🔄 VÉRIFICATION CRITIQUE: Création forcée de app.service.js pour assurer le démarrage..."
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
        console.log('✅ AppService initialisé avec succès');
    }
    
    getHello() {
        return 'NionFar API is running!';
    }
    
    getStatus() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
    }
};
AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
exports.AppService = AppService;
EOL
echo "✅ Fichier app.service.js créé avec succès"

# Modification directe des imports dans app.controller.js
if [ -f "dist/app.controller.js" ]; then
  echo "🔄 Correction des imports dans app.controller.js..."
  
  # Sauvegarde du fichier original
  cp dist/app.controller.js dist/app.controller.js.bak
  
  # Remplacement de la ligne d'import problématique
  sed -i 's|require.*app.service.*|require("./app.service.js");|' dist/app.controller.js
  
  # Vérification supplémentaire
  if grep -q "app.service.js" dist/app.controller.js; then
    echo "✅ Import de app.service.js corrigé dans app.controller.js"
  else
    echo "⚠️ Échec de la correction automatique, application d'une correction manuelle..."
    # Si le sed a échoué, réécrire complètement le début du fichier
    {
      echo 'require("reflect-metadata");'
      echo '"use strict";'
      echo 'var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {'
      echo '    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;'
      echo '    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);'
      echo '    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;'
      echo '    return c > 3 && r && Object.defineProperty(target, key, r), r;'
      echo '};'
      echo 'var __metadata = (this && this.__metadata) || function (k, v) {'
      echo '    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);'
      echo '};'
      echo 'Object.defineProperty(exports, "__esModule", { value: true });'
      echo 'exports.AppController = void 0;'
      echo 'const common_1 = require("@nestjs/common");'
      echo 'const app_service_1 = require("./app.service.js");'
    } > dist/app.controller.js.new
    
    # Extraire tout sauf les 15 premières lignes de l'original
    tail -n +16 dist/app.controller.js.bak >> dist/app.controller.js.new
    
    # Remplacer le fichier
    mv dist/app.controller.js.new dist/app.controller.js
    echo "✅ Réécriture complète du début de app.controller.js effectuée"
  fi
else
  echo "⚠️ app.controller.js non trouvé dans dist/, problème de build plus grave"
fi

# Assurer que les liens sont corrects
echo "🔍 Création de liens symboliques de secours..."
if [ -f "dist/app.service.js" ]; then
  # Créer des liens symboliques dans les différents répertoires possibles
  mkdir -p dist/src
  if [ ! -f "dist/src/app.service.js" ]; then
    ln -sf ../app.service.js dist/src/app.service.js
  fi
  echo "✅ Liens symboliques créés pour app.service.js"
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

# Correction finale de la structure dist avant le démarrage
if [ -f "scripts/fix-dist-structure.js" ]; then
  echo "🔧 Correction de la structure dist pour assurer la compatibilité..."
  node scripts/fix-dist-structure.js
else
  echo "⚠️ Script de correction de la structure dist non trouvé."
fi

# Options de performance
export NODE_OPTIONS="--max-old-space-size=512 --enable-source-maps"

# Vérification finale de la présence du fichier critique
echo "🔍 Vérification finale de app.service.js..."
if [ -f "dist/app.service.js" ]; then
  echo "✅ app.service.js est présent et prêt pour le démarrage!"
else
  echo "⚠️ app.service.js est toujours manquant malgré les corrections!"
fi

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