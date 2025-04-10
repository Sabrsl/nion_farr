# Déploiement du Backend Nionfar sur Railway

Ce document détaille les configurations et ajustements effectués pour déployer le backend Nionfar sur Railway.

## Fichiers de configuration

Les fichiers suivants ont été ajoutés ou modifiés pour permettre le déploiement sur Railway :

- `railway.json` - Configuration principale pour Railway
- `nixpacks.toml` - Configuration Nixpacks pour optimiser le build
- `Dockerfile.railway` - Dockerfile personnalisé pour Railway
- `.env.railway` - Variables d'environnement pour Railway

## Variables d'environnement requises

Assurez-vous que les variables d'environnement suivantes sont configurées sur Railway :

- `MONGODB_URI` - URL de connexion à la base de données MongoDB
- `JWT_SECRET` - Clé secrète pour les tokens JWT
- `JWT_REFRESH_SECRET` - Clé secrète pour les tokens de rafraîchissement
- `PORT` - Port d'écoute (généralement 3000)
- `RAILWAY_DEPLOYMENT=true` - Indique que l'application est déployée sur Railway
- `IS_RENDER=false` - Désactive les configurations spécifiques à Render

## Vérification des configurations

Pour vérifier que toutes les configurations nécessaires sont en place, exécutez :

```bash
npm run check:railway-env
```

Ce script vérifie :
- La présence des variables d'environnement requises
- Les configurations dans les fichiers de code
- Suggère des actions si des ajustements sont nécessaires

## Gestion de la mémoire

Les optimisations suivantes ont été appliquées pour adapter l'application aux contraintes de mémoire de Railway :

1. **Détection automatique** - L'application détecte qu'elle s'exécute sur Railway via la variable `RAILWAY_DEPLOYMENT`
2. **Garbage Collection** - Configuration optimisée du garbage collector Node.js
3. **Limitation des workers** - Le nombre de workers est automatiquement ajusté en fonction de la mémoire disponible

## Modifications dans le code

Les fichiers suivants ont été adaptés pour prendre en charge Railway :

### `src/config/environment.ts`
- Ajout de la détection de Railway via `RAILWAY_DEPLOYMENT`
- Optimisation du garbage collector pour Railway
- Ajout de la propriété `deploymentPlatform` pour une meilleure identification dans les logs

### `src/main.ts`
- Ajout de logs spécifiques pour Railway
- Amélioration des informations de démarrage pour inclure la plateforme de déploiement

### `src/health/health.service.ts`
- Ajout d'informations sur la plateforme de déploiement dans les vérifications de santé
- Détection et affichage des informations spécifiques à Railway

## Déploiement et surveillances

Après le déploiement, surveillez les métriques suivantes :

- **Utilisation mémoire** - Vérifiez que l'application reste dans les limites allouées
- **Performance** - Comparez les temps de réponse avec Render
- **Logs** - Examinez les logs pour détecter d'éventuels problèmes liés à Railway

## Rollback

En cas de besoin, consultez le document `DISABLE-RENDER.md` pour savoir comment revenir à Render de manière sécurisée.

## Bonnes pratiques

- Testez toujours les changements dans un environnement de développement avant de déployer en production
- Utilisez la commande `npm run check:railway-env` avant chaque déploiement
- Maintenez les variables d'environnement synchronisées entre les environnements de développement et de production
- Surveillez régulièrement l'état de l'application via l'endpoint `/health` 