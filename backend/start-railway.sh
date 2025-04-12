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

# Création des décorateurs d'authentification manquants
echo "🔄 VÉRIFICATION CRITIQUE: Création des décorateurs d'authentification manquants..."

# Créer le dossier pour les décorateurs
mkdir -p dist/modules/auth/decorators

# Créer le décorateur public.decorator.js
cat > dist/modules/auth/decorators/public.decorator.js << EOL
require('reflect-metadata');
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
exports.Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
EOL
echo "✅ Décorateur public.decorator.js créé avec succès"

# Créer le décorateur roles.decorator.js si présent dans le code source
if [ -f "src/modules/auth/decorators/roles.decorator.ts" ]; then
  cat > dist/modules/auth/decorators/roles.decorator.js << EOL
require('reflect-metadata');
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
EOL
  echo "✅ Décorateur roles.decorator.js créé avec succès"
fi

# Créer un fichier index.js pour faciliter les imports
cat > dist/modules/auth/decorators/index.js << EOL
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./public.decorator.js"), exports);
EOL
if [ -f "src/modules/auth/decorators/roles.decorator.ts" ]; then
  echo "__exportStar(require(\"./roles.decorator.js\"), exports);" >> dist/modules/auth/decorators/index.js
fi
echo "✅ Fichier index.js des décorateurs créé avec succès"

# Création du module d'authentification s'il est manquant
echo "🔄 VÉRIFICATION CRITIQUE: Création du module d'authentification..."
mkdir -p dist/modules/auth

# Créer auth.module.js s'il est manquant
if [ ! -f "dist/modules/auth/auth.module.js" ]; then
  cat > dist/modules/auth/auth.module.js << EOL
require('reflect-metadata');
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");

let AuthModule = class AuthModule {};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'defaultSecret',
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
            }),
        ],
        controllers: [],
        providers: [],
        exports: [jwt_1.JwtModule],
    })
], AuthModule);
exports.AuthModule = AuthModule;
EOL
  echo "✅ Module d'authentification créé avec succès"
fi

# Créer auth.controller.js s'il est manquant
if [ ! -f "dist/modules/auth/auth.controller.js" ]; then
  cat > dist/modules/auth/auth.controller.js << EOL
require('reflect-metadata');
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");

let AuthController = class AuthController {
    constructor() {
        console.log('✅ AuthController initialisé');
    }
};
AuthController = __decorate([
    (0, common_1.Controller)('auth')
], AuthController);
exports.AuthController = AuthController;
EOL
  echo "✅ Contrôleur d'authentification créé avec succès"
fi

# Créer index.js pour le module auth
if [ ! -f "dist/modules/auth/index.js" ]; then
  cat > dist/modules/auth/index.js << EOL
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./auth.module.js"), exports);
__exportStar(require("./auth.controller.js"), exports);
EOL
  echo "✅ Index du module auth créé avec succès"
fi

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
  
  # Correction des imports vers le décorateur Public
  sed -i 's|require.*modules/auth/decorators/public.decorator.*|require("./modules/auth/decorators/public.decorator.js");|' dist/app.controller.js
  
  # Correction des imports vers le module auth
  sed -i 's|require.*modules/auth/auth.module.*|require("./modules/auth/auth.module.js");|' dist/app.controller.js
  
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
      echo 'const public_decorator_1 = require("./modules/auth/decorators/public.decorator.js");'
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

# Vérification finale de la présence des fichiers critiques
echo "🔍 Vérification finale des fichiers critiques..."
if [ -f "dist/app.service.js" ]; then
  echo "✅ app.service.js est présent!"
else
  echo "⚠️ app.service.js est toujours manquant malgré les corrections!"
fi

if [ -f "dist/modules/auth/decorators/public.decorator.js" ]; then
  echo "✅ public.decorator.js est présent!"
else
  echo "⚠️ public.decorator.js est toujours manquant malgré les corrections!"
fi

if [ -f "dist/modules/auth/auth.module.js" ]; then
  echo "✅ auth.module.js est présent!"
else
  echo "⚠️ auth.module.js est toujours manquant malgré les corrections!"
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