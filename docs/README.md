# Documentation du Projet NionFar

Ce dossier contient la documentation complète du projet NionFar.

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

Si vous rencontrez des problèmes d'installation, veuillez consulter le [Guide de maintenance](./maintenance.md).

## Démarrage du projet

```bash
# Démarrer le frontend uniquement
npm run frontend

# Démarrer le backend uniquement
npm run backend

# Démarrer les deux simultanément
npm run dev:all

# Démarrer avec Docker
npm run dev:docker
```

## Déploiement

Pour déployer l'application, suivez les étapes du guide de déploiement et vérifiez tous les points de la [checklist post-déploiement](./post-deployment-checklist.md) pour assurer une bonne connexion entre le frontend et le backend. 