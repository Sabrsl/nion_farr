# Nionfar Backend

API NestJS pour la plateforme de freelance NionFar.sn

## Prérequis

- Node.js (v18 ou supérieur)
- MongoDB (v5 ou supérieur)
- npm ou yarn

## Installation

```bash
# Installation des dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement dans le fichier .env
```

## Développement

```bash
# Mode développement avec rechargement automatique
npm run start:dev

# Mode debug
npm run start:debug
```

## Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

## Build et déploiement

```bash
# Build de l'application
npm run build

# Mode production
npm run start:prod
```

## Déploiement sur Render

### Configuration sur Render

1. Créez un nouveau service Web
2. Connectez votre dépôt GitHub
3. Configurez les paramètres suivants:
   - **Name**: nionfar-backend
   - **Runtime**: Node
   - **Root Directory**: backend
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### Variables d'environnement requises

Configurez ces variables dans l'interface Render (Dashboard > Environment):

```
NODE_ENV=production
PORT=3000
API_PREFIX=api
APP_URL=https://nionfar.up.railway.app
FRONTEND_URL=https://nion-farr.vercel.app

# MongoDB
MONGODB_URI=<votre chaîne de connexion MongoDB>

# JWT (générer des clés sécurisées avec le script generate-secrets.ts)
JWT_SECRET=<secret JWT généré>
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=<secret refresh JWT généré>
JWT_REFRESH_EXPIRES_IN=7d

# Autres services (si nécessaire)
MAIL_HOST=<serveur SMTP>
MAIL_PORT=<port>
MAIL_USER=<utilisateur>
MAIL_PASSWORD=<mot de passe>
MAIL_FROM=<adresse email>
```

### Génération de secrets sécurisés

Pour générer des secrets JWT sécurisés, utilisez le script fourni:

```bash
npm run generate:secrets
```

### Gestion des secrets

- Ne stockez **JAMAIS** de secrets dans le code source
- Utilisez uniquement les variables d'environnement de Render pour les informations sensibles
- Changez régulièrement les clés JWT
- Utilisez des secrets différents pour les environnements de développement, test et production

## Fallback Server

Le script `render-build.sh` inclut un serveur de secours qui s'active automatiquement en cas d'échec du build principal. Ce serveur:

- Fournit une réponse aux routes essentielles
- Renvoie un état dégradé pour les opérations d'écriture
- Permet à l'interface utilisateur de rester fonctionnelle même en cas de problèmes de base de données

## Bonnes pratiques de sécurité

1. **Protection des données**
   - Toutes les clés API et tokens doivent être stockés dans les variables d'environnement
   - Utiliser le fichier `.env` uniquement pour le développement local
   - Ne jamais commettre de fichiers `.env` contenant des secrets

2. **API et authentification**
   - Valider toutes les entrées utilisateur
   - Utiliser les middlewares de sécurité
   - Implémenter une limitation de débit pour prévenir les attaques de force brute

3. **Base de données**
   - Utiliser des utilisateurs MongoDB avec privilèges limités
   - Activer l'authentification sur le cluster MongoDB
   - Effectuer des sauvegardes régulières

4. **Maintenance**
   - Surveiller les journaux d'erreurs dans le tableau de bord Render
   - Mettre à jour régulièrement les dépendances (npm audit)
   - Tester les nouvelles fonctionnalités avant le déploiement en production 

## Memory Optimization

This application includes built-in memory optimization features for deployment on platforms with limited resources (such as Render's free tier).

### Memory Optimization Features

1. **Environment-aware Configuration**
   - Memory-optimized settings are automatically applied when running in constrained environments
   - MongoDB connection pools are reduced in size
   - Database synchronization is disabled
   - Throttling windows are extended
   - Scheduled tasks can be disabled

2. **Memory Monitoring**
   - Real-time memory usage tracking
   - Automatic memory cleanup attempts when thresholds are exceeded
   - Graceful shutdown handlers to prevent crashes

3. **How to Enable Memory Optimization**

   Set one of the following environment variables:
   ```
   MEMORY_OPTIMIZED=true
   ```
   
   Or use the provided scripts:
   ```
   npm run start:low-memory
   ```
   
   For Render deployment, the configuration is already optimized in `render.yaml`.

4. **Monitoring Memory Usage**

   Use the included script to monitor memory usage:
   ```
   npm run monitor:memory
   ```

5. **Troubleshooting Memory Issues**

   If you encounter OOM (Out of Memory) errors:
   
   - Check if memory optimization is enabled
   - Reduce the frequency of scheduled tasks
   - Review database queries for potential optimizations
   - Consider upgrading to a higher resource tier

### Memory-Optimized Scripts

- `npm run start:render` - Builds and starts the app with memory optimization for Render
- `npm run start:low-memory` - Starts the app with memory optimization
- `npm run monitor:memory` - Monitors memory usage in real-time 

## CI/CD

Le projet utilise GitHub Actions pour vérifier automatiquement que le build pour Railway fonctionne correctement. 