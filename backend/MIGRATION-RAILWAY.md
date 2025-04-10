# Migration du backend Nionfar de Render vers Railway

Ce document détaille la procédure de migration du backend Nionfar depuis Render vers Railway, en veillant à ce que le processus soit fiable et réversible.

## Phase 1: Préparation

### Configuration de l'environnement Railway

1. **Créer un projet Railway**
   ```bash
   # Installation de l'interface CLI Railway (si nécessaire)
   npm install -g @railway/cli
   
   # Login à Railway
   railway login
   
   # Lier le dépôt au projet Railway
   railway link
   ```

2. **Copier les variables d'environnement**
   ```bash
   # Exporter les variables depuis Render
   npm run export:render-env
   
   # Vérifier et adapter pour Railway
   node scripts/adapt-env-for-railway.js
   
   # Importer dans Railway
   railway variables set --from=.env.railway
   ```

3. **Configuration de la base de données**
   - Assurez-vous que la base de données MongoDB est accessible par Railway
   - Vérifiez les restrictions d'accès IP et ajustez-les si nécessaire
   - Testez la connexion depuis un environnement de développement configuré avec les paramètres Railway

### Adaptation du code

1. **Ajout des fichiers de configuration Railway**
   - `railway.json` - Configuration du projet
   - `nixpacks.toml` - Optimisation de build
   - `Dockerfile.railway` (si nécessaire)

2. **Ajout de la détection de plateforme**
   - Modifier `src/config/environment.ts` pour détecter Railway
   - Adapter les configurations spécifiques à la plateforme

3. **Tests en environnement local**
   ```bash
   # Tester avec la configuration Railway
   npm run start:railway-local
   
   # Vérifier les points d'API critiques
   npm run test:railway-endpoints
   ```

## Phase 2: Déploiement en parallèle

### Premier déploiement Railway

1. **Déploiement initial**
   ```bash
   # Déployer sur Railway
   railway up
   ```

2. **Vérification initiale**
   - Vérifier que l'application démarre correctement
   - Vérifier l'endpoint `/health`
   - Examiner les logs pour détecter des problèmes

3. **Configuration des domaines**
   - Configurer un sous-domaine de staging pour Railway (ex: `api-railway.nionfar.sn`)
   - Vérifier la configuration SSL/TLS

### Tests en parallèle

1. **Tests automatisés**
   ```bash
   # Exécuter les tests contre Railway
   npm run test:e2e -- --api-url=https://api-railway.nionfar.sn
   ```

2. **Tests de charge comparatifs**
   ```bash
   # Tester les performances comparatives
   npm run benchmark:compare -- --render-url=https://api.nionfar.sn --railway-url=https://api-railway.nionfar.sn
   ```

3. **Validation manuelle**
   - Tester l'application frontend contre l'API Railway
   - Vérifier les fonctionnalités critiques
   - Comparer les temps de réponse

## Phase 3: Migration complète

### Sauvegarde avant basculement

1. **Backup des données**
   ```bash
   npm run backup:before-migration
   ```

2. **Capture des configurations Render**
   ```bash
   npm run export:render-config
   ```

### Basculement des domaines

1. **Basculement DNS**
   - Modifier les enregistrements DNS pour pointer `api.nionfar.sn` vers Railway
   - Réduire le TTL avant le changement pour accélérer la propagation
   - Conserver l'accès à Render via un sous-domaine alternatif (ex: `api-render.nionfar.sn`)

2. **Vérification du basculement**
   ```bash
   # Vérifier la propagation DNS
   npm run check:dns -- --domain=api.nionfar.sn
   
   # Vérifier que les requêtes sont bien servies par Railway
   npm run check:serving-platform -- --domain=api.nionfar.sn
   ```

3. **Surveillance post-basculement**
   - Surveiller intensivement les métriques pendant les 24 premières heures
   - Suivre les taux d'erreur et les temps de réponse
   - Être prêt à revenir à Render en cas de problème critique

## Phase 4: Désactivation de Render

Après au moins une semaine de fonctionnement stable sur Railway:

1. **Suspend (ne pas supprimer) le service Render**
   - Documentation détaillée dans [DISABLE-RENDER.md](./DISABLE-RENDER.md)

2. **Conserver les accès et sauvegardes**
   - Maintenir les accès administratifs à Render
   - Conserver toutes les sauvegardes et configurations
   - Documenter la procédure de restauration

## Procédure de rollback

En cas de problème majeur nécessitant un retour à Render:

1. **Réactiver le service Render** (si suspendu)
   - Se connecter au dashboard Render
   - Réactiver le service suspendu

2. **Basculer le DNS**
   - Modifier les enregistrements DNS pour pointer à nouveau vers Render
   - Vérifier la propagation

3. **Vérifier la restauration**
   ```bash
   # Vérifier que le service Render répond correctement
   npm run check:health -- --url=https://api-render.nionfar.sn
   ```

4. **Analyse post-mortem**
   - Documenter les problèmes rencontrés avec Railway
   - Établir un plan pour les résoudre avant une nouvelle tentative de migration

## Comparaison des plateformes

| Aspect | Render | Railway |
|--------|--------|---------|
| Coût mensuel | €xx.xx | €xx.xx |
| Mémoire allouée | X GB | Y GB |
| Auto-scaling | Oui/Non | Oui/Non |
| Temps de démarrage | ~Xmin | ~Ymin |
| Temps de déploiement | ~Xmin | ~Ymin |
| Temps de réponse moyen | Xms | Yms |

## Contacts et support

- **Railway Support**: [support.railway.app](https://support.railway.app)
- **Documentation Railway**: [docs.railway.app](https://docs.railway.app)
- **Contact interne**: tech@nionfar.sn 