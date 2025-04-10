# Guide de migration de Render vers Railway

Ce document détaille les étapes pour migrer l'API NionFar de Render vers Railway, en garantissant une transition sans downtime, sans perte de données et en préservant toutes les fonctionnalités existantes.

## Prérequis

- Un compte Railway (plan gratuit est suffisant pour commencer)
- Git et CLI Railway installés sur votre machine
- Accès au dépôt GitHub du projet
- Accès au dashboard Render actuel

## Étape 1: Préparation avant migration

1. **Sauvegardez les variables d'environnement actuelles de Render**

```bash
cd backend
npm run export:render-env
```

2. **Créez une sauvegarde de la base de données MongoDB**

```bash
npm run backup:before-migration
```

3. **Vérifiez que le build fonctionne correctement**

```bash
npm run build
```

4. **Préparez les fichiers de configuration pour Railway**

```bash
cp .env .env.railway
```

Modifiez le fichier `.env.railway` pour adapter les variables d'environnement à Railway. Veillez particulièrement à :
- Configurer `MONGODB_URI` avec la même connexion MongoDB
- Conserver les secrets JWT identiques pour assurer la continuité des sessions
- Définir `RAILWAY_DEPLOYMENT=true` et `IS_RENDER=false`
- Configurer `APP_URL=https://nionfar.up.railway.app` (URL du déploiement Railway)

## Étape 2: Configuration du projet Railway

### Via CLI Railway

1. **Logguez-vous à Railway**

```bash
railway login
```

2. **Initialisez un nouveau projet Railway**

```bash
railway init
```

3. **Liez votre projet GitHub**

```bash
railway link
```

4. **Configurez les variables d'environnement**

```bash
# Importez les variables depuis votre fichier .env.railway
railway env import .env.railway
```

### Via l'interface Web Railway

1. Créez un nouveau projet sur [Railway](https://railway.app/dashboard)
2. Choisissez "Deploy from GitHub repository"
3. Sélectionnez votre dépôt GitHub
4. Configurez les variables d'environnement en vous basant sur le fichier `.env.railway`
5. Configurez le projet:
   - Build command: `npm install && npm run build`
   - Start command: `npm run start:railway`

## Étape 3: Déploiement et validation

1. **Déployez l'application**

Soit via un push Git, soit en déclenchant manuellement un déploiement dans l'interface Railway.

2. **Validez le déploiement**

```bash
npm run validate:railway
```

Ce script vérifiera que les endpoints critiques fonctionnent correctement, notamment `/api/services/categories/count`.

## Étape 4: Transition en production

### Stratégie de transition sans downtime

1. **Période de test parallèle**
   - Gardez Render actif pendant que Railway fonctionne
   - Testez toutes les fonctionnalités critiques sur Railway (URL: https://nionfar.up.railway.app)
   - Vérifiez les performances et la stabilité

2. **Mise à jour des DNS (si applicable)**
   - Si vous utilisez un domaine personnalisé, préparez un changement de DNS vers Railway

3. **Bascule du trafic**
   - Une fois que tout est confirmé fonctionnel, redirigez le trafic vers Railway
   - Mettez Render en pause (ne le supprimez pas immédiatement)

### Rollback en cas de problème

Si des problèmes sont détectés sur Railway:

1. Réactivez votre service Render
2. Restaurez les DNS (si modifiés)
3. Diagnostiquez et corrigez les problèmes sur Railway

## Étape 5: Finalisation

Après une période de stabilité (recommandé: 1-2 semaines):

1. Suspendez définitivement le service Render
2. Optimisez votre configuration Railway selon les performances observées
3. Envisagez un plan payant Railway si nécessaire pour les performances

## Différences entre Render et Railway

### Limites à connaître

| Fonctionnalité | Render (Free) | Railway (Free) |
|----------------|---------------|----------------|
| RAM            | 512 MB        | 512 MB         |
| CPU            | Partagé, limité | Partagé, limité |
| Execution      | Suspendu après inactivité | Toujours actif (limité à 500 heures/mois) |
| Stockage       | Limité        | 1 GB           |
| Base de données | MongoDB Atlas séparé | Option intégrée (mais nous gardons Atlas) |

### Adaptations dans le code

Nous avons optimisé le code pour fonctionner dans les deux environnements:

1. Détection d'environnement Railway
2. Optimisation mémoire adaptée
3. Configuration MongoDB optimisée

## Suivi et monitoring

1. **Surveillez les métriques Railway**
   - Utilisation mémoire
   - Temps de réponse
   - Logs d'erreurs

2. **Monitoring MongoDB**
   - Vérifiez les performances des requêtes
   - Surveillez la taille de la base de données

## Support et dépannage

Si vous rencontrez des problèmes durant la migration:

1. Vérifiez les logs Railway via l'interface web ou la commande:
   ```bash
   railway logs
   ```

2. Consultez la documentation Railway: https://docs.railway.app/
3. Problèmes courants:
   - Variables d'environnement manquantes
   - Problèmes de connexion MongoDB
   - Limites de ressources atteintes 