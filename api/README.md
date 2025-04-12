# Déploiement de l'API NionFar sur Vercel

Ce dossier contient les fichiers nécessaires pour déployer l'API NionFar sur Vercel en tant que fonction serverless.

## Structure

- `index.js` : Point d'entrée serverless qui initialise l'application NestJS et expose l'instance Express via serverless-http.
- `package.json` : Dépendances spécifiques au mode serverless.

## Déploiement

### Préparation

1. Assurez-vous que l'application NestJS est compilée : `cd backend && npm run build`
2. Exécutez le script de préparation : `cd backend && npm run prepare:vercel`

### Configuration sur Vercel

1. Créez un nouveau projet sur Vercel et importez votre dépôt.
2. Configurez les variables d'environnement suivantes dans le Dashboard Vercel :
   - `NODE_ENV` : `production`
   - `MONGODB_URI` : URL de votre base de données MongoDB
   - `JWT_SECRET` : Votre clé secrète pour les JWT
   - `JWT_EXPIRES_IN` : Durée de validité des JWT (ex: `7d`)
   - `CORS_ALLOWED_ORIGINS` : Liste des origines autorisées (ex: `https://nion-farr.vercel.app,http://localhost:3000`)
   - `VERCEL` : `1` (cette variable est automatiquement définie par Vercel)
   - Autres variables d'environnement spécifiques à votre application...

3. Configurez les paramètres de déploiement suivants :
   - **Framework** : `Other`
   - **Build Command** : `cd backend && npm run build:vercel`
   - **Output Directory** : Laissez vide

### Intégration avec le Front-end

Le front-end déployé sur Vercel (`https://nion-farr.vercel.app`) peut communiquer avec l'API déployée sur `https://nion-farr-backend.vercel.app/api`. Par exemple, pour appeler l'endpoint d'authentification :

```javascript
// Front-end
const response = await fetch('https://nion-farr-backend.vercel.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});
```

## Dépannage

- **Erreur Cold Start** : Si vous rencontrez des erreurs de délai d'attente lors du démarrage de l'application, vérifiez les logs dans le Dashboard Vercel.
- **Problèmes CORS** : Assurez-vous que le domaine front-end est bien inclus dans la liste des origines autorisées.
- **Variables d'environnement** : Vérifiez que toutes les variables d'environnement nécessaires sont configurées correctement.

## Limites

- Les fonctions serverless ont une durée d'exécution limitée (10 secondes sur Vercel).
- La taille du bundle est limitée (50 MB non compressés sur Vercel).
- Les connexions WebSocket ne sont pas directement prises en charge.

## Ressources

- [Documentation Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation serverless-http](https://github.com/dougmoscrop/serverless-http) 