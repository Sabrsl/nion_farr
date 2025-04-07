# Nionfar - Plateforme de Services Freelance

## Présentation
Nionfar est une plateforme de mise en relation entre freelances et clients, spécialement conçue pour le marché sénégalais.

## Architecture

Le projet est divisé en deux parties principales :
- **Backend** : API REST développée avec NestJS, déployée sur Render
- **Frontend** : Application web développée avec Next.js, déployée sur Vercel

## Déploiement

### Déploiement du Backend sur Render

1. Connectez-vous à votre compte Render et créez un nouveau Web Service
2. Connectez votre dépôt GitHub ou importez le code
3. Configurez le service comme suit :
   - **Nom** : nionfar-backend
   - **Root Directory** : nionfar/backend
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start:prod`

4. Ajoutez les variables d'environnement suivantes (ou importez-les depuis le fichier .env.production) :
   - NODE_ENV=production
   - API_PREFIX=api
   - FRONTEND_URL=https://nionfar.vercel.app
   - ADDITIONAL_CORS_ORIGINS=https://nionfar.vercel.app,https://*.vercel.app
   - MONGODB_URI=votre_url_mongodb_atlas
   - JWT_SECRET=générer_un_secret_aléatoire
   - JWT_EXPIRES_IN=1d
   - JWT_REFRESH_SECRET=générer_un_secret_aléatoire
   - JWT_REFRESH_EXPIRES_IN=7d
   - Ajoutez toutes les autres variables du fichier .env.production

5. Cliquez sur "Create Web Service"

### Déploiement du Frontend sur Vercel

1. Connectez-vous à votre compte Vercel et importez votre projet depuis GitHub
2. Configurez le déploiement comme suit :
   - **Framework Preset** : Next.js
   - **Root Directory** : nionfar/frontend
   - **Build Command** : `cd nionfar/frontend && NODE_OPTIONS='--max_old_space_size=4096' npm install --legacy-peer-deps && NEXT_DISABLE_ESLINT=1 NODE_ENV=production npm run build`
   - **Output Directory** : nionfar/frontend/.next
   - **Install Command** : `npm install`

3. Créez un fichier `package.json` à la racine du projet (si nécessaire) avec :
   ```json
   {
     "name": "nionfar-monorepo",
     "private": true,
     "scripts": {
       "postinstall": "npm install @mui/icons-material react-toastify react-dropzone @headlessui/react classnames resend mongodb bcryptjs msw --prefix nionfar/frontend"
     }
   }
   ```

4. Ajoutez les variables d'environnement suivantes :
   - NEXT_PUBLIC_API_URL=https://nionfar-backend.onrender.com/api
   - NEXT_PUBLIC_APP_URL=https://nionfar.vercel.app
   - NEXT_PUBLIC_ENVIRONMENT=production
   - NEXTAUTH_URL=https://nionfar.vercel.app
   - NEXTAUTH_SECRET=générer_un_secret_aléatoire
   
   Note: Vous pouvez coller le contenu d'un fichier .env pour pré-remplir automatiquement les variables.

5. Cliquez sur "Deploy"

### URLs des services déployés

- Backend API: https://nionfar-backend.onrender.com/api
- Documentation API: https://nionfar-backend.onrender.com/api/docs (si activée)
- Frontend: https://nionfar.vercel.app

### Notes importantes

- Les services gratuits de Render "s'endorment" après 15 minutes d'inactivité, ce qui peut entraîner un temps de chargement plus long lors du premier accès
- Vercel fournit un excellent service gratuit pour les projets Next.js avec des déploiements automatiques et des URL de prévisualisation pour chaque branche

## Développement local

### Backend
```bash
cd nionfar/backend
npm install
npm run start:dev
```

### Frontend
```bash
cd nionfar/frontend
npm install
npm run dev
```

## Fonctionnalités principales

- Inscription et authentification des utilisateurs
- Publication et recherche de services
- Système de commandes et de paiements
- Messagerie intégrée
- Système d'évaluation
- Tableau de bord pour freelances et clients
- Administration de la plateforme

## Structure du Projet

Le projet est organisé en deux parties principales :

```
nionfar/
├── backend/ - API NestJS avec TypeORM et MongoDB
├── frontend/ - Interface utilisateur Next.js avec MSW pour les mocks
```

## Technologies Utilisées

### Backend
- **NestJS** - Framework Node.js pour construire des applications serveur efficaces et scalables
- **TypeORM** - ORM pour la gestion des entités SQL
- **MongoDB** - Base de données NoSQL pour le stockage flexible des données
- **Mongoose** - ODM pour MongoDB
- **Passport** - Authentification
- **JWT** - Gestion des tokens

### Frontend
- **Next.js** - Framework React pour les applications web
- **Tailwind CSS** - Framework CSS utilitaire
- **MSW (Mock Service Worker)** - Mocking d'API pour le développement frontend

## Installation

### Prérequis
- Node.js v18+
- MongoDB 

### Étapes d'installation

1. Cloner le dépôt
```bash
git clone https://github.com/votre-username/nionfar.git
cd nionfar
```

2. Installer les dépendances du backend
```bash
cd backend
npm install
```

3. Installer les dépendances du frontend
```bash
cd ../frontend
npm install
```

4. Configurer les variables d'environnement
   - Copier les fichiers `.env.example` vers `.env` dans les dossiers backend et frontend
   - Modifier les valeurs selon votre environnement

## Développement

### Démarrer le backend
```bash
cd backend
npm run start:dev
```

### Démarrer le frontend
```bash
cd frontend
npm run dev
```

### Initialiser la base de données
```bash
cd backend
npm run seed
```

## Structure de la Base de Données

Le projet utilise MongoDB avec les collections suivantes :
- `users` - Utilisateurs (admin, clients, freelances)
- `services` - Services proposés par les freelances
- `orders` - Commandes passées par les clients
- `messages` - Messages entre clients et freelances
- `reviews` - Avis sur les services
- `payments` - Transactions financières
- `disputes` - Litiges sur les commandes
- `notifications` - Notifications système
- `logs` - Journaux système
- `alerts` - Alertes et événements importants

## API Routes

Le backend expose plusieurs endpoints API:

- `POST /api/auth/login` - Authentification
- `GET /api/users` - Liste des utilisateurs
- `GET /api/services` - Liste des services
- `POST /api/orders` - Créer une commande
- *Et bien d'autres...*

## Utilisateurs de Test

L'application est préchargée avec les utilisateurs suivants :

- **Admin**: admin@nionfar.com / Admin123!
- **Client**: client1@nionfar.com / Admin123!
- **Freelancer**: freelancer1@nionfar.com / Admin123!

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## Contact

Pour toute question ou support, veuillez contacter l'équipe à nionfar@example.com 