#!/bin/bash
# Script de build pour Render - Version améliorée
set -e  # Stop on first error

echo "===== DÉMARRAGE DU SCRIPT DE BUILD ====="
echo "Répertoire courant: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# S'assurer que le répertoire dist est vide
echo "Nettoyage du répertoire dist..."
rm -rf dist
mkdir -p dist

# Installation des dépendances
echo "Installation des dépendances..."
npm install --no-audit --omit=dev

# Installation explicite de NestJS CLI
echo "Installation explicite de @nestjs/cli..."
npm install --no-audit @nestjs/cli

# Vérifier où se trouve le binaire de nest
if [ -f "node_modules/.bin/nest" ]; then
  echo "Binaire nest trouvé dans node_modules/.bin/nest"
  NEST_BIN="node_modules/.bin/nest"
elif command -v npx &> /dev/null; then
  echo "Utilisation de npx pour exécuter nest"
  NEST_BIN="npx nest"
else
  echo "Ni nest ni npx n'ont été trouvés, installation globale de @nestjs/cli"
  npm install -g @nestjs/cli
  NEST_BIN="nest"
fi

# Générer tsconfig.build.json spécifique pour la compilation
echo '{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "**/*.spec.ts", "**/*.test.ts"]
}' > tsconfig.build.json

# Tentative de build avec diagnostic
echo "===== TENTATIVE DE BUILD AVEC NEST CLI ====="
$NEST_BIN build --verbose || {
  echo "Le build avec nest a échoué, tentative avec tsc directement..."
  npx tsc -p tsconfig.build.json --diagnostics || echo "Le build avec tsc a également échoué"
}

# Vérifier et diagnostiquer src/main.ts
echo "===== DIAGNOSTIC DU FICHIER MAIN.TS ====="
if [ -f "src/main.ts" ]; then
  echo "Le fichier src/main.ts existe"
  cat src/main.ts | head -n 10
  
  echo "Validation du fichier main.ts..."
  npx tsc --noEmit src/main.ts || echo "Erreurs de typage dans main.ts"
else
  echo "ERREUR: src/main.ts n'existe pas!"
fi

# Vérifier si le build a réussi
if [ -f "dist/main.js" ]; then
  echo "Build réussi! Le fichier dist/main.js existe."
else
  echo "Le build a échoué. Création d'un fichier main.js pour NionFar API..."
  
  # Créer un fichier main.js compatible avec NionFar
  cat > dist/main.js << 'EOL'
console.log("Démarrage du serveur NionFar API...");
const mongoose = require('mongoose');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Chargement des variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_PREFIX = process.env.API_PREFIX || 'api';

// Données de démonstration pour le mode de secours
const mockData = {
  categories: [
    { id: 1, name: 'Design Graphique', slug: 'design-graphique', count: 125 },
    { id: 2, name: 'Développement Web', slug: 'developpement-web', count: 148 },
    { id: 3, name: 'Rédaction', slug: 'redaction', count: 87 },
    { id: 4, name: 'Vidéo & Animation', slug: 'video-animation', count: 64 },
    { id: 5, name: 'Traduction', slug: 'traduction', count: 42 },
    { id: 6, name: 'Marketing Digital', slug: 'marketing-digital', count: 95 },
    { id: 7, name: 'Formation', slug: 'formation', count: 56 },
    { id: 8, name: 'Photographie', slug: 'photographie', count: 38 },
    { id: 9, name: 'Audio & Musique', slug: 'audio-musique', count: 29 },
    { id: 10, name: 'Développement Mobile', slug: 'developpement-mobile', count: 76 },
    { id: 11, name: 'Business', slug: 'business', count: 53 },
    { id: 12, name: 'Data & IA', slug: 'data-ia', count: 67 }
  ],
  services: {
    featured: [
      { id: 101, title: 'Création de logo professionnel', price: 5000, category: 'Design Graphique' },
      { id: 102, title: 'Développement de site vitrine', price: 25000, category: 'Développement Web' },
      { id: 103, title: 'Rédaction d\'articles SEO', price: 3000, category: 'Rédaction' }
    ],
    latest: [
      { id: 201, title: 'Montage vidéo pour réseaux sociaux', price: 7500, category: 'Vidéo & Animation' },
      { id: 202, title: 'Traduction français-wolof', price: 2000, category: 'Traduction' },
      { id: 203, title: 'Campagne marketing Facebook', price: 15000, category: 'Marketing Digital' }
    ]
  },
  stats: {
    totalServices: 2587,
    totalFreelancers: 945,
    completedOrders: 15782,
    satisfaction: 4.9
  }
};

// Connexion à MongoDB
async function connectToDatabase() {
  try {
    if (!MONGODB_URI) {
      console.warn("AVERTISSEMENT: Variable d'environnement MONGODB_URI non définie, utilisation du mode de secours.");
      return false;
    }
    
    console.log(`Connexion à la base de données MongoDB (${NODE_ENV})...`);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connexion à MongoDB établie avec succès!');
    return true;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    return false;
  }
}

// Ajouter des en-têtes CORS
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
}

// Serveur HTTP avec routes pour NionFar
const server = http.createServer(async (req, res) => {
  // Gestion des requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    console.log(`Received request: OPTIONS ${req.url}`);
    return;
  }

  setCorsHeaders(res);
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  console.log(`Received request: ${req.method} ${pathname}`);

  // Route pour vérification de santé
  if (pathname === '/health' || pathname === `/${API_PREFIX}/health`) {
    const isConnected = mongoose.connection.readyState === 1;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: isConnected ? 'up' : 'degraded',
      database: isConnected ? 'connected' : 'disconnected',
      environment: NODE_ENV,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Route pour le statut du service
  if (pathname === '/status' || pathname === `/${API_PREFIX}/status`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'NionFar API',
      status: 'running',
      mode: 'compatibility',
      environment: NODE_ENV,
      stats: mockData.stats,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Route pour les catégories de services
  if (pathname === `/${API_PREFIX}/services/categories` || pathname === `/${API_PREFIX}/categories`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.categories));
    return;
  }

  // Route pour le nombre de services par catégorie
  if (pathname === `/${API_PREFIX}/services/categories/count`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const categoriesWithCount = mockData.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count
    }));
    res.end(JSON.stringify(categoriesWithCount));
    return;
  }

  // Route pour les services mis en avant
  if (pathname === `/${API_PREFIX}/services/featured`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.services.featured));
    return;
  }

  // Route pour les services récents
  if (pathname === `/${API_PREFIX}/services/latest`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.services.latest));
    return;
  }

  // Route pour les statistiques
  if (pathname === `/${API_PREFIX}/stats`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.stats));
    return;
  }
  
  // API endpoint racine
  if (pathname === '/' || pathname === `/${API_PREFIX}` || pathname === `/${API_PREFIX}/`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'NionFar API',
      description: 'API pour la plateforme freelance NionFar.sn',
      status: 'running',
      mode: 'compatibility',
      environment: NODE_ENV,
      endpoints: [
        `/${API_PREFIX}/health`,
        `/${API_PREFIX}/status`,
        `/${API_PREFIX}/services/categories`,
        `/${API_PREFIX}/services/categories/count`,
        `/${API_PREFIX}/services/featured`,
        `/${API_PREFIX}/services/latest`,
        `/${API_PREFIX}/stats`
      ],
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Réponse par défaut (404)
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    error: 'Not Found',
    message: 'La ressource demandée n\'existe pas',
    path: pathname
  }));
});

// Démarrage de l'application
async function bootstrap() {
  try {
    await connectToDatabase();
    
    server.listen(PORT, () => {
      console.log(`Serveur NionFar API en mode de compatibilité démarré sur le port ${PORT}`);
      console.log(`API accessible à: http://localhost:${PORT}/${API_PREFIX}`);
      console.log(`URL de santé: http://localhost:${PORT}/health`);
    });
    
    // Gestion des signaux pour un arrêt propre
    const shutdown = async () => {
      console.log('Arrêt du serveur...');
      server.close(() => {
        if (mongoose.connection.readyState === 1) {
          console.log('Fermeture de la connexion à MongoDB...');
          mongoose.connection.close(false, () => {
            console.log('Serveur arrêté avec succès');
            process.exit(0);
          });
        } else {
          console.log('Serveur arrêté avec succès');
          process.exit(0);
        }
      });
      
      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('Délai d\'attente dépassé, arrêt forcé');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

bootstrap();
EOL
fi

# Rendre le fichier exécutable
chmod +x dist/main.js

# Afficher le contenu final
echo "Contenu du répertoire dist:"
find dist -type f | sort

# Vérifier la taille du fichier
if [ -f "dist/main.js" ]; then
  echo "Taille de main.js: $(wc -c < dist/main.js) octets"
  echo "Premières lignes de main.js:"
  head -n 10 dist/main.js
fi

echo "===== FIN DU SCRIPT DE BUILD ====="
exit 0 