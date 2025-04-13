# Documentation du Projet NionFar

## Note personnelle

Ce projet est en développement pour mon usage personnel et n'est pas destiné à être utilisé ou maintenu par d'autres personnes. Les fonctionnalités sont ajustées selon mes besoins spécifiques.

## Contenu

- [Guide de maintenance](./maintenance.md) : Instructions pour maintenir et dépanner le projet
- [Structure du projet](./structure.md) : Description détaillée de l'organisation du projet
- [API](./api.md) : Documentation de l'API backend
- [Checklist post-déploiement](./post-deployment-checklist.md) : Vérifications à effectuer après un déploiement en production

## Installation

Pour installer toutes les dépendances du projet :

```bash
npm run install:all
```

## Démarrage du projet

```bash
# Démarrer le frontend uniquement
npm run frontend

# Démarrer le backend uniquement
npm run backend

# Démarrer les deux simultanément
npm run dev:all
```

## Déploiement actuel

- **Frontend** : Déployé sur Vercel - https://nion-farr.vercel.app
- **Backend** : Déployé sur Render - https://nionfar-backend.onrender.com

Pour les vérifications post-déploiement, consultez la [checklist post-déploiement](./post-deployment-checklist.md). 