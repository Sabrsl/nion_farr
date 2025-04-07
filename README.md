# Nionfar - Plateforme de Services Freelance

Nionfar est une plateforme moderne de mise en relation entre freelances et clients, offrant un système complet de gestion de services, commandes, paiements et messagerie.

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