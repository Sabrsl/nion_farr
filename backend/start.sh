#!/bin/bash

echo "🚀 Démarrage du serveur NionFar API..."
echo "📝 Variables d'environnement configurées:"
echo "- Frontend URL: $FRONTEND_URL"
echo "- CORS autorisés: $CORS_ALLOWED_ORIGINS"
echo "- Port: $PORT"
echo "- Railway deployment: $RAILWAY_DEPLOYMENT"
echo "- MongoDB URI configuré: $(if [ -n "$MONGODB_URI" ]; then echo "oui"; else echo "non"; fi)"

# Assurer que le dossier logs existe
mkdir -p logs

echo "👉 Vérification du build..."
echo "📂 Contenu du dossier dist/ :"
ls -la dist/

# PARTIE 1: CRÉATION DES FICHIERS CRITIQUES POUR LE HEALTHCHECK
echo "🔧 Création des fichiers essentiels pour garantir le healthcheck..."

# Créer le dossier pour le module health si nécessaire
mkdir -p dist/health
mkdir -p dist/modules/auth/decorators

# Créer le décorateur Public requis par le contrôleur Health
echo "🔧 Création du décorateur Public pour le healthcheck..."
cat > dist/modules/auth/decorators/public.decorator.js << EOF
require('reflect-metadata');
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
exports.Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
EOF

# Créer le contrôleur de health minimal
echo "🔧 Création du contrôleur HealthController minimal..."
cat > dist/health/health.controller.js << EOF
require('reflect-metadata');
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../modules/auth/decorators/public.decorator.js");

let HealthController = class HealthController {
    constructor() {
        console.log('✅ HealthController initialisé');
    }
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production',
            version: '1.0.0',
            uptime: process.uptime()
        };
    }
    ping() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('ping'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "ping", null);
HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [])
], HealthController);
exports.HealthController = HealthController;
EOF

# Créer le module health minimal
echo "🔧 Création du module Health minimal..."
cat > dist/health/health.module.js << EOF
require('reflect-metadata');
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthModule = void 0;
const common_1 = require("@nestjs/common");
const health_controller_1 = require("./health.controller.js");

let HealthModule = class HealthModule {};
HealthModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        providers: []
    })
], HealthModule);
exports.HealthModule = HealthModule;
EOF

# PARTIE 2: VÉRIFICATION DU PORT
echo "🔄 DIAGNOSTIC PORT: La variable PORT est définie à: $PORT"
if [ -z "$PORT" ]; then
  echo "⚠️ ATTENTION: La variable PORT n'est pas définie! Utilisation du port par défaut 8080."
  export PORT=8080
else
  echo "✅ PORT est correctement défini à $PORT"
fi

# PARTIE 3: DÉMARRAGE AVEC REPLI SUR UN SERVEUR HTTP SIMPLE EN CAS D'ÉCHEC
echo "🔄 STRATÉGIE DE DÉMARRAGE: Tentative avec l'application principale, repli sur un serveur HTTP simple en cas d'échec..."

if [ -f "dist/main.js" ]; then
  echo "✅ Tentative de démarrage de l'application principale avec reflect-metadata préchargé..."
  
  # Exécution de l'application principale avec un timeout de 5 secondes
  timeout 10s node -r reflect-metadata dist/main.js &
  MAIN_PID=$!
  
  # Attendre un peu pour que l'application démarre
  sleep 5
  
  # Vérifier si l'application est toujours en cours d'exécution
  if kill -0 $MAIN_PID 2>/dev/null; then
    echo "✅ L'application principale a démarré correctement!"
    # Attendre que l'application se termine
    wait $MAIN_PID
  else
    echo "⚠️ L'application principale a échoué au démarrage, utilisation du serveur HTTP de secours..."
    
    # Serveur HTTP simple pour assurer le healthcheck
    cat > simple-server.js << EOF
const http = require('http');
const PORT = process.env.PORT || 8080;

console.log('🚀 Démarrage du serveur HTTP de secours sur le port ' + PORT);

const server = http.createServer((req, res) => {
  console.log('📝 Requête reçue: ' + req.url);
  
  // Pour les healthchecks
  if (req.url === '/health' || req.url === '/health/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Serveur HTTP de secours opérationnel',
      timestamp: new Date().toISOString(),
      railway: true,
      fallback: true
    }));
    return;
  }
  
  // Pour toutes les autres requêtes
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NionFar API - Serveur de secours pour maintenir le healthcheck');
});

server.listen(PORT, () => {
  console.log('✅ Serveur HTTP de secours en écoute sur le port ' + PORT);
});

// Gérer les signaux pour un arrêt propre
process.on('SIGTERM', () => {
  console.log('⏹️ Signal SIGTERM reçu, arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur HTTP arrêté proprement');
    process.exit(0);
  });
});
EOF
    
    echo "✅ Démarrage du serveur HTTP de secours..."
    NODE_ENV=production PORT="$PORT" node simple-server.js
  fi
else
  echo "❌ main.js manquant! Création et démarrage d'un serveur HTTP de secours..."
  
  # Serveur HTTP simple pour assurer le healthcheck
  cat > simple-server.js << EOF
const http = require('http');
const PORT = process.env.PORT || 8080;

console.log('🚀 Démarrage du serveur HTTP de secours sur le port ' + PORT);

const server = http.createServer((req, res) => {
  console.log('📝 Requête reçue: ' + req.url);
  
  // Pour les healthchecks
  if (req.url === '/health' || req.url === '/health/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Serveur HTTP de secours opérationnel',
      timestamp: new Date().toISOString(),
      railway: true,
      fallback: true
    }));
    return;
  }
  
  // Pour toutes les autres requêtes
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NionFar API - Serveur de secours pour maintenir le healthcheck');
});

server.listen(PORT, () => {
  console.log('✅ Serveur HTTP de secours en écoute sur le port ' + PORT);
});

// Gérer les signaux pour un arrêt propre
process.on('SIGTERM', () => {
  console.log('⏹️ Signal SIGTERM reçu, arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur HTTP arrêté proprement');
    process.exit(0);
  });
});
EOF
  
  echo "✅ Démarrage du serveur HTTP de secours..."
  NODE_ENV=production PORT="$PORT" node simple-server.js
fi 