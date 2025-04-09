# Documentation de l'API NionFar

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Tous les points d'accès protégés nécessitent un en-tête d'autorisation avec un token valide.

```
Authorization: Bearer <token>
```

### Points d'accès d'authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/login | Connexion utilisateur |
| POST | /api/auth/register | Inscription utilisateur |
| POST | /api/auth/refresh | Rafraîchir le token |
| POST | /api/auth/logout | Déconnexion |

## Utilisateurs

### Points d'accès utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/users | Récupérer tous les utilisateurs (admin) |
| GET | /api/users/:id | Récupérer un utilisateur spécifique |
| PUT | /api/users/:id | Mettre à jour un utilisateur |
| DELETE | /api/users/:id | Supprimer un utilisateur |

## Services

### Points d'accès services

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/services | Récupérer tous les services |
| GET | /api/services/:id | Récupérer un service spécifique |
| POST | /api/services | Créer un nouveau service |
| PUT | /api/services/:id | Mettre à jour un service |
| DELETE | /api/services/:id | Supprimer un service |

## Commandes

### Points d'accès commandes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/orders | Récupérer toutes les commandes |
| GET | /api/orders/:id | Récupérer une commande spécifique |
| POST | /api/orders | Créer une nouvelle commande |
| PUT | /api/orders/:id | Mettre à jour une commande |
| DELETE | /api/orders/:id | Supprimer une commande |

## Paiements

### Points d'accès paiements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/payments/initiate | Initier un paiement |
| GET | /api/payments/:id | Vérifier le statut d'un paiement |
| POST | /api/payments/webhook | Webhook pour les notifications de paiement |

## Litiges

### Points d'accès litiges

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/disputes | Récupérer tous les litiges |
| GET | /api/disputes/:id | Récupérer un litige spécifique |
| POST | /api/disputes | Créer un nouveau litige |
| PUT | /api/disputes/:id | Mettre à jour un litige |
| POST | /api/disputes/:id/messages | Ajouter un message à un litige |

## Notifications

### Points d'accès notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/notifications | Récupérer les notifications de l'utilisateur |
| PUT | /api/notifications/:id | Marquer une notification comme lue |
| DELETE | /api/notifications/:id | Supprimer une notification | 