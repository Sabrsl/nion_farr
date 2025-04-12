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
└── vercel.json                # Configuration pour Vercel
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

### Déploiement sur Vercel

Le déploiement sur Vercel est géré par la configuration dans `vercel.json` et le point d'entrée serverless dans le dossier `api/`.

#### Étapes de déploiement:

1. Vercel clone le dépôt
2. Le build est lancé via la commande `npm run build:vercel`
3. Les fonctions serverless sont initialisées à partir du point d'entrée
4. Les requêtes vers `/api/*` sont routées vers l'application NestJS

#### Variables d'environnement:

Configuration requise:
- `MONGODB_URI`: URI de connexion à MongoDB
- `JWT_SECRET`: Clé secrète pour les tokens JWT
- `NODE_ENV`: Environnement (production)
- `VERCEL`: Défini automatiquement à '1' par Vercel

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

1. Consultez les logs de déploiement sur Vercel
2. Vérifiez les variables d'environnement
3. Assurez-vous que la structure du build est correcte
4. Vérifiez les journaux d'application dans `/logs`
5. Utilisez l'endpoint `/health/detailed` pour un diagnostic complet
6. Examinez les métriques Prometheus sur `/metrics`

## MongoDB Validation Scripts

The project includes several scripts to ensure MongoDB data integrity:

### Running Tests and Audits

```bash
# Run MongoDB schema validation tests
npm run test:mongodb

# Run MongoDB data audit
npm run mongodb:audit

# Run both tests and audit
npm run mongodb:validate
```

### Database Maintenance

```bash
# Fix MongoDB schema issues
npm run mongodb:fix

# Prepare MongoDB for production (fixes + validators)
npm run mongodb:prepare

# Schedule automated MongoDB audits
npm run mongodb:schedule-audit
```

### Schema Validation

The database uses MongoDB schema validators to ensure data integrity. The validation scripts verify:

- Required fields exist with correct types
- Indexes are properly created for performance
- Documents comply with expected schema structure

The validation process creates detailed reports in the `audit-reports` directory. 