# Guide de maintenance du projet NionFar

## Structure du projet

Le projet NionFar est organisé avec une structure claire :

- `/frontend` : Application Next.js pour l'interface utilisateur
- `/backend` : API NestJS pour la logique métier
- `/docs` : Documentation du projet
- Fichiers de configuration à la racine

## Résolution des problèmes courants

### Problèmes de dépendances manquantes

Si vous rencontrez des erreurs liées à des dépendances manquantes comme :

```
Cannot find module '@nestjs/common' or its corresponding type declarations
```

La solution est d'installer correctement les dépendances :

1. Pour le backend :
   ```bash
   cd backend
   npm install
   ```

2. Pour le frontend :
   ```bash
   cd frontend
   npm install
   ```

3. Pour les dépendances globales :
   ```bash
   npm install
   ```

Vous pouvez également utiliser le script dans package.json :
```bash
npm run install:all
```

### Erreurs TypeScript dans le backend

Les erreurs TypeScript dans le backend sont souvent liées à des dépendances manquantes. Après avoir installé les dépendances, redémarrez le serveur de développement :

```bash
npm run backend
```

## Commandes utiles

- Démarrer le frontend : `npm run frontend`
- Démarrer le backend : `npm run backend`
- Démarrer les deux : `npm run dev:all`
- Démarrer avec Docker : `npm run dev:docker`
- Arrêter Docker : `npm run stop`

## Structure des dossiers

```
nionfar.sn/
├── frontend/          # Application Next.js
├── backend/           # API NestJS
├── docs/              # Documentation
├── .github/           # Configuration GitHub Actions
├── package.json       # Scripts et dépendances du projet
└── docker-compose.yml # Configuration Docker
``` 