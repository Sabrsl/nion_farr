# Checklist Post-Déploiement Frontend + Backend (Production)

## 🔁 Synchronisation et Connexions

### Configuration des URLs

- [ ] Vérifier que `NEXT_PUBLIC_API_URL` dans le frontend pointe vers `https://nionfar-backend.onrender.com/api`
  - Fichier à vérifier: `frontend/.env.production`
  - Valeur actuelle: `NEXT_PUBLIC_API_URL=https://nionfar-backend.onrender.com/api`
  - Utilisé dans: 
    - `frontend/services/authService.ts`: pour les appels d'authentification
    - `frontend/services/paymentGatewayService.ts`: pour les appels de paiement
  
- [ ] Vérifier que `FRONTEND_URL` dans le backend est configuré sur `https://nion-farr.vercel.app` 
  - Fichier à vérifier: `.env` sur Render
  - Utilisé dans: 
    - `backend/src/main.ts` pour la configuration CORS (lignes 84-105)
    - `backend/src/modules/email/email.service.ts` pour les liens de vérification email (ligne 60)
    - `backend/src/modules/email/email.service.ts` pour les liens de réinitialisation de mot de passe (ligne 72)

- [ ] Vérifier que les redirections après authentification utilisent les bonnes URLs
  - Dans `frontend/services/authService.ts`:
    - La page de profil après inscription: `/dashboard` pour freelance, `/` pour client
    - Vérifier que les redirections utilisent `process.env.NEXT_PUBLIC_APP_URL` (actuellement `https://nion-farr.vercel.app`)

### Configuration CORS

- [ ] Vérifier que le backend autorise les requêtes depuis `https://nion-farr.vercel.app`
  - Fichier: `backend/src/main.ts` (lignes ~84-105)
  - La configuration récupère `FRONTEND_URL` depuis les variables d'environnement
  - Si `ADDITIONAL_CORS_ORIGINS` est défini, il ajoute ces origines (séparées par des virgules)
  - En production, les origines autorisées sont limitées à celles configurées

- [ ] Vérifier que les en-têtes CORS appropriés sont configurés dans le backend:
  - `Access-Control-Allow-Origin`: configuré via `origin: allowedOrigins`
  - `Access-Control-Allow-Methods`: configuré comme `['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']`
  - `Access-Control-Allow-Headers`: configuré comme `['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']`
  - `credentials`: configuré comme `true` (important pour les cookies d'authentification)

- [ ] Tester une requête CORS préliminaire (OPTIONS) pour vérifier la configuration
  - Route de test recommandée: `/api/health` ou toute autre route publique

## 🔒 Sécurité et Authentification

- [ ] Vérifier que les tokens JWT sont correctement émis et validés
  - Configuration JWT dans le backend: `JWT_SECRET` et `JWT_EXPIRATION`
  - Service d'authentification frontend: `frontend/services/authService.ts`

- [ ] Tester le processus d'authentification complet:
  - Inscription: `POST /api/auth/register`
  - Connexion: `POST /api/auth/login`
  - Vérification du token: Toute route protégée
  - Rafraîchissement: `POST /api/auth/refresh`
  - Déconnexion: `POST /api/auth/logout`

- [ ] Vérifier que les routes protégées nécessitent bien un token valide
  - Tester avec un token invalide ou expiré
  - Vérifier que la réponse est un 401 Unauthorized

- [ ] Vérifier que les rôles utilisateurs sont correctement appliqués
  - Routes admin: `/api/users` (GET liste complète)
  - Routes vendeur: `/api/services` (POST, PUT, DELETE)
  - Le service `authService.ts` définit les rôles comme 'client', 'freelance' ou 'admin'

## 🌐 Vérification des Routes API

### Routes d'authentification
- [ ] POST `/api/auth/login` - Test avec des identifiants valides
- [ ] POST `/api/auth/register` - Test avec un nouvel utilisateur
- [ ] POST `/api/auth/refresh` - Test avec un refresh token valide
- [ ] POST `/api/auth/logout` - Test de déconnexion

### Routes utilisateurs
- [ ] GET `/api/users` (admin) - Nécessite un token admin
- [ ] GET `/api/users/:id` - Vérifier l'accès à son propre profil
- [ ] PUT `/api/users/:id` - Mettre à jour son propre profil
- [ ] DELETE `/api/users/:id` - Suppression de compte (admin ou soi-même)

### Routes services
- [ ] GET `/api/services` - Liste des services publics
- [ ] GET `/api/services/:id` - Détails d'un service
- [ ] POST `/api/services` - Création d'un service (vendeur)
- [ ] PUT `/api/services/:id` - Mise à jour d'un service (propriétaire)
- [ ] DELETE `/api/services/:id` - Suppression d'un service (propriétaire ou admin)

### Routes commandes
- [ ] GET `/api/orders` - Liste des commandes (filtrées selon le rôle)
- [ ] GET `/api/orders/:id` - Détail d'une commande
- [ ] POST `/api/orders` - Création d'une commande
- [ ] PUT `/api/orders/:id` - Mise à jour d'une commande
- [ ] DELETE `/api/orders/:id` - Annulation d'une commande

### Routes paiements
- [ ] POST `/api/payments/wave/initiate` - Initier un paiement Wave
- [ ] POST `/api/payments/orange-money/initiate` - Initier un paiement Orange Money
- [ ] GET `/api/payments/wave/status` et `/api/payments/orange-money/status` - Vérifier le statut d'un paiement
- [ ] POST `/api/payments/wave/callback` et `/api/payments/orange-money/callback` - Tester les webhooks

## 📊 Performance et Monitoring

- [ ] Vérifier les logs Vercel pour les erreurs côté frontend
  - Accéder au tableau de bord Vercel: https://vercel.com/dashboard
  - Vérifier la section "Logs" de votre projet

- [ ] Vérifier les logs Render pour les erreurs côté backend
  - Accéder au tableau de bord Render: https://dashboard.render.com/
  - Vérifier les logs du service backend
  - Rechercher spécifiquement les erreurs CORS et les problèmes de connexion à la base de données

- [ ] Vérifier les temps de réponse des API
  - Tester les routes principales avec cURL ou Postman et mesurer les temps
  - Vérifier que les temps de réponse sont inférieurs à 1000ms pour les routes critiques

- [ ] Vérifier la consommation de ressources sur Render
  - Vérifier la mémoire et le CPU utilisés
  - S'assurer que le service ne s'approche pas des limites du plan

## 📱 Compatibilité

- [ ] Tester l'application sur desktop (Chrome, Firefox, Safari, Edge)
- [ ] Tester l'application sur mobile (iOS, Android)
- [ ] Vérifier l'affichage responsive
  - Tester particulièrement les pages d'inscription, de connexion et de paiement
  - Vérifier que les formulaires de paiement mobiles fonctionnent correctement

## 📄 Variables d'environnement à vérifier

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://nionfar-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://nion-farr.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
```

### Backend (Render)
```
PORT=8080
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nionfar
JWT_SECRET=<secret_key>
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=<refresh_secret_key>
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://nion-farr.vercel.app
ADDITIONAL_CORS_ORIGINS=https://www.nion-farr.vercel.app,https://nionfar.vercel.app
NODE_ENV=production
EMAIL_FROM=noreply@nionfar.sn
EMAIL_FROM_NAME=NionFar
```

## 🛠️ Procédure de vérification des connexions

1. **Vérifier la configuration frontend**:
   ```bash
   # Depuis le répertoire frontend
   cat .env.production
   grep -r "NEXT_PUBLIC_API_URL" --include="*.js" --include="*.ts" --include="*.tsx" .
   ```

2. **Vérifier la configuration CORS backend**:
   ```bash
   # Depuis le répertoire backend
   grep -r "enableCors" --include="*.ts" src/
   grep -r "FRONTEND_URL" --include="*.ts" src/
   ```

3. **Tester une requête API avec cURL**:
   ```bash
   # Requête OPTIONS pour vérifier CORS
   curl -X OPTIONS -H "Origin: https://nion-farr.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -v https://nionfar-backend.onrender.com/api/health
   
   # Requête de test API
   curl -X GET https://nionfar-backend.onrender.com/api/health
   ```

4. **Vérifier les logs en production**:
   - Consulter le tableau de bord Vercel pour les logs frontend (https://vercel.com/dashboard)
   - Consulter le tableau de bord Render pour les logs backend (https://dashboard.render.com/)

## 🔄 Plan d'action en cas de problème

1. **Problème CORS**:
   - Vérifier la configuration CORS dans `backend/src/main.ts`
   - Vérifier que la variable `FRONTEND_URL` est correcte dans les variables d'environnement Render
   - Ajouter d'autres origines si nécessaire via `ADDITIONAL_CORS_ORIGINS`
   - Redéployer le backend après mise à jour des variables d'environnement

2. **Problème d'authentification**:
   - Vérifier `JWT_SECRET`, `JWT_EXPIRATION`, `JWT_REFRESH_SECRET` et `JWT_REFRESH_EXPIRES_IN` dans les variables d'environnement
   - S'assurer que les tokens sont correctement stockés et transmis côté frontend
   - Vérifier les redirections après authentification

3. **Problème de connexion API**:
   - Vérifier que `NEXT_PUBLIC_API_URL` est correctement défini dans Vercel
   - Vérifier que le backend est en ligne et répond correctement
   - Tester les routes API directement avec cURL ou Postman pour isoler le problème
   - Vérifier les logs de requêtes dans Render pour identifier les erreurs précises 