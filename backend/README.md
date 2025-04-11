# NionFar API Backend

## Présentation

Backend de l'application NionFar, construit avec NestJS et MongoDB.

## Architecture

Le backend est structuré selon l'architecture modulaire de NestJS:

```
backend/
├── src/                        # Code source
│   ├── common/                 # Composants réutilisables (pipes, guards, etc.)
│   ├── config/                 # Configuration de l'application
│   ├── database/               # Configuration de la base de données et migrations
│   ├── health/                 # Endpoints de surveillance et diagnostics
│   ├── modules/                # Modules fonctionnels de l'application
│   ├── performance/            # Outils de suivi des performances
│   ├── security/               # Fonctionnalités liées à la sécurité
│   ├── scripts/                # Scripts utilitaires
│   ├── app.controller.ts       # Contrôleur principal
│   ├── app.module.ts           # Module principal
│   └── main.ts                 # Point d'entrée de l'application
├── dist/                       # Code compilé (généré par build)
├── scripts/                    # Scripts de déploiement et maintenance
├── logs/                       # Journaux d'application
├── .env                        # Variables d'environnement locales
└── railway.json                # Configuration de déploiement Railway
```

## Environnements et Déploiement

### Configuration

La configuration de l'application se fait via les variables d'environnement:

- `NODE_ENV`: Environnement d'exécution (`development`, `production`, `test`)
- `PORT`: Port d'écoute du serveur
- `MONGODB_URI`: URI de connexion à la base de données MongoDB
- `JWT_SECRET`: Clé secrète pour les JWT
- `JWT_EXPIRES_IN`: Durée de validité des JWT
- `FRONTEND_URL`: URL du frontend pour la configuration CORS
- `MEMORY_OPTIMIZED`: Active le mode d'optimisation mémoire (`true`/`false`)

### Déploiement sur Railway

Le déploiement sur Railway est géré par la configuration dans `railway.json`. Ce fichier définit:

1. **Build**: Utilisation d'un Dockerfile pour construire l'image
2. **Démarrage**: Exécution via le script `start-railway.sh`
3. **Healthcheck**: Vérification de l'état sur `/health` toutes les 15 secondes
4. **Redémarrage**: Politique de redémarrage en cas d'échec (10 tentatives maximum)

#### Processus de déploiement

1. Railway clone le dépôt et construit l'image Docker
2. Le script `start-railway.sh` est exécuté au démarrage
3. Ce script:
   - Vérifie la structure du dossier `dist/`
   - Copie et corrige les fichiers nécessaires
   - Lance l'application avec les bonnes options de mémoire
   - Si le démarrage échoue, utilise un serveur de secours

#### Mécanismes de résilience

Le système intègre plusieurs couches de résilience:

1. **Structure du dossier dist/**: Correction automatique via `fix-dist-structure.js`
2. **Healthchecks**: Points de terminaison `/health`, `/health/ping` et `/health/detailed`
3. **Serveur de secours**: Un serveur minimaliste qui répond aux healthchecks
4. **Gestion de la mémoire**: Optimisations pour les environnements contraints
5. **Logging structuré**: Tous les logs sont au format JSON pour faciliter le débogage

### Migration de la base de données

Les migrations sont gérées automatiquement au démarrage si `RUN_MIGRATIONS=true`:

1. Le service `MigrationService` détecte les migrations non appliquées
2. Les migrations sont exécutées séquentiellement dans une transaction
3. Chaque migration réussie est enregistrée dans la collection `migrations`

Les fichiers de migration se trouvent dans `src/database/migrations/scripts/` et doivent exporter une fonction `up()`.

## Surveillance et diagnostics

### Healthchecks

L'API expose plusieurs endpoints de healthcheck:

- `GET /health`: Vérification de base (état de la base de données)
- `GET /health/ping`: Vérification rapide sans accès à la base de données
- `GET /health/detailed`: Vérification détaillée avec informations système

### Métriques Prometheus

Les métriques de performance sont exposées au format Prometheus:

- `GET /metrics`: Métriques système et application
  - HTTP: requêtes totales, durée, requêtes en cours
  - Database: durée des requêtes
  - System: utilisation mémoire, CPU

## Développement

### Installation

```bash
npm install
```

### Exécution en développement

```bash
npm run start:dev
```

### Build

```bash
npm run build
```

### Exécution en production

```bash
npm run start:prod
```

### Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

## Résolution des problèmes

### Erreurs de déploiement courantes

1. **Module non trouvé**: Vérifier que le module est correctement référencé dans `package.json` et inclus dans le build.
2. **Erreur de connexion MongoDB**: Vérifier l'URI de connexion et les autorisations réseau.
3. **Out of Memory**: Activer `MEMORY_OPTIMIZED=true` pour réduire l'empreinte mémoire.
4. **Réflexion TypeScript manquante**: Assurez-vous que `reflect-metadata` est importé dans les fichiers principaux.

### Diagnostic

Pour faciliter le diagnostic des problèmes:

1. Consultez les logs de déploiement sur Railway
2. Vérifiez les journaux d'application dans `/logs`
3. Utilisez l'endpoint `/health/detailed` pour un diagnostic complet
4. Examinez les métriques Prometheus sur `/metrics` 