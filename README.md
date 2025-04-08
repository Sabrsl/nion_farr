# NionFar.sn - Plateforme de services freelance au Sénégal

NionFar.sn ("Nion Far" en wolof) est une plateforme web moderne, professionnelle et sécurisée inspirée de 5euros.com, adaptée au marché sénégalais. Cette plateforme permet aux freelances de proposer leurs services à partir de 1000 FCFA.

![NionFar Preview](docs/preview.png)

## Démo

Vous pouvez explorer une démo du projet sur [nionfar.sn](https://nionfar.sn) (à venir)

## Fonctionnalités Implémentées

- ✅ **Interface utilisateur moderne et responsive** : Design TailwindCSS adapté aux appareils mobiles, tablettes et ordinateurs
- ✅ **Page d'accueil** : Présentation de la plateforme, témoignages, catégories populaires
- ✅ **Explorer les services** : Recherche, filtrage par catégories et options avancées (prix, évaluation)
- ✅ **Affichage des services** : Vue grille/liste adaptative, tri et favoris
- ✅ **Filtres de recherche** : Filtrage par catégories, prix, évaluation et délai de livraison
- ✅ **Design responsive** : Optimisé pour toutes les tailles d'écran avec menu mobile adaptatif

## Fonctionnalités à Venir

- 🔄 **Authentification sécurisée** : JWT + 2FA, vérification email
- 🔄 **Création de services** : Interface pour les freelances
- 🔄 **Paiements locaux** : Intégration Wave, Orange Money, Free Money et cartes bancaires
- 🔄 **Tableaux de bord** : Interfaces dédiées pour freelances et clients
- 🔄 **Messagerie intégrée** : Communication directe entre clients et freelances
- 🔄 **Système d'avis** : Évaluations et commentaires sur les services
- 🔄 **Système d'escrow** : Paiement sécurisé débloqué après validation
- 🔄 **Interface admin** : Gestion complète des utilisateurs, services, litiges et retraits
- 🔄 **Système d'affiliation** : Programme de parrainage pour développer la communauté
- 🔄 **Notifications** : Alertes par email et SMS

## Structure du Projet

```
nionfar/
├── frontend/            # Application Next.js
│   ├── components/      # Composants React réutilisables
│   │   ├── explorer/    # Composants spécifiques à la page Explorer
│   │   ├── layout/      # Composants de mise en page (Header, Footer)
│   │   └── ui/          # Composants UI réutilisables
│   ├── data/            # Données statiques et mocks
│   ├── pages/           # Pages Next.js
│   ├── public/          # Actifs statiques (images, etc.)
│   ├── styles/          # Styles globaux
│   └── types/           # Types TypeScript
├── backend/             # API NestJS (à venir)
└── docs/                # Documentation
```

## Technologies Utilisées

### Frontend
- **React.js** avec **Next.js** pour le rendu côté serveur
- **TailwindCSS** pour un design responsive et moderne
- **TypeScript** pour un code robuste et typé
- **Framer Motion** pour les animations
- **React Icons** pour les icônes

### Backend (à venir)
- Framework **NestJS** avec TypeScript
- Base de données **PostgreSQL**
- **TypeORM** pour la gestion des entités et des migrations
- API RESTful documentée avec **Swagger**
- **WebSockets** pour les fonctionnalités en temps réel

## Installation et Démarrage

### Prérequis
- Node.js v18+
- npm ou yarn

### Installation locale

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/nionfar.git
   cd nionfar
   ```

2. **Installation des dépendances frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Accéder à l'application**
   Ouvrez votre navigateur et accédez à http://localhost:3000

### Installation avec Docker (à venir)
```bash
docker-compose up -d
```

## Captures d'écran

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
  <img src="docs/screenshots/home.png" alt="Page d'accueil" width="400"/>
  <img src="docs/screenshots/explorer.png" alt="Page Explorer" width="400"/>
  <img src="docs/screenshots/filter-mobile.png" alt="Filtres sur mobile" width="200"/>
  <img src="docs/screenshots/list-view.png" alt="Vue liste" width="400"/>
</div>

## Contribution

Les contributions sont les bienvenues ! Si vous souhaitez contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalités (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

Consultez le fichier [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## Équipe et Contact

NionFar est développé et maintenu par l'équipe NionFar.

Pour toute question ou suggestion, n'hésitez pas à nous contacter à contact@nionfar.sn.

## Licence

Propriétaire - Tous droits réservés © 2025 NionFar.sn 