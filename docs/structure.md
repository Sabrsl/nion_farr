# Structure du Projet NionFar

## Organisation générale

Le projet est organisé en deux parties principales :

1. **Frontend** : Application Next.js
2. **Backend** : API NestJS

## Structure des dossiers

```
nionfar.sn/
├── frontend/          # Application Next.js
│   ├── components/    # Composants React
│   ├── contexts/      # Contextes React pour la gestion d'état
│   ├── hooks/         # Hooks personnalisés
│   ├── pages/         # Pages et routes Next.js
│   ├── public/        # Fichiers statiques
│   ├── services/      # Services d'API
│   ├── styles/        # Styles CSS/SCSS
│   └── utils/         # Fonctions utilitaires
│
├── backend/           # API NestJS
│   ├── config/        # Configuration de l'application
│   ├── controllers/   # Contrôleurs REST
│   ├── db/            # Configuration de la base de données
│   ├── dto/           # Objets de transfert de données
│   ├── guards/        # Gardes d'authentification
│   ├── modules/       # Modules NestJS
│   ├── services/      # Services métier
│   └── src/           # Code source principal
│
├── docs/              # Documentation
├── .github/           # Configuration GitHub Actions
├── package.json       # Scripts et dépendances du projet
└── docker-compose.yml # Configuration Docker
```

## Configuration

### Frontend

- **Next.js** : Le frontend utilise Next.js pour le rendu côté serveur et le routage
- **Tailwind CSS** : Pour les styles
- **React Icons** : Pour les icônes
- **Axios** : Pour les requêtes HTTP

### Backend

- **NestJS** : Framework Node.js pour le backend
- **MongoDB** : Base de données NoSQL via Mongoose
- **JWT** : Pour l'authentification
- **Swagger** : Pour la documentation de l'API

## Déploiement

- **Frontend** : Déployé sur Vercel
- **Backend** : Déployé sur Render
- **CI/CD** : Configuré avec GitHub Actions 