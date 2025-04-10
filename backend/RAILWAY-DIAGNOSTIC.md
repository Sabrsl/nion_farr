# Diagnostic et finalisation du déploiement Railway

## Variables d'environnement Railway

Toutes les variables d'environnement suivantes doivent être configurées dans votre projet Railway. Utilisez l'interface Railway pour mettre à jour ces variables ou utilisez la CLI Railway.

```bash
# Pour ajouter une variable via CLI:
railway vars set VAR_NAME="value"
```

### Variables essentielles

| Variable                | Valeur                                                                                                                                      |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| NODE_ENV                | production                                                                                                                                  |
| PORT                    | 3000                                                                                                                                        |
| API_PREFIX              | api                                                                                                                                         |
| APP_URL                 | https://nionfar.up.railway.app                                                                                                              |
| FRONTEND_URL            | https://nion-farr.vercel.app                                                                                                                |
| CORS_ALLOWED_ORIGINS    | https://nion-farr.vercel.app                                                                                                                |
| MONGODB_URI             | mongodb+srv://vynalapp:uVmENC9K21dkMfma@clusternionfar.rjuvvf7.mongodb.net/nionfar?retryWrites=true&w=majority&appName=Clusternionfar      |
| DB_AUTH_SOURCE          | admin                                                                                                                                       |
| JWT_SECRET              | b8d742192e1dff9c2df428d0a9c2b1d5386a731eb0a1a56b97bd42bb31d0ec0a                                                                           |
| JWT_EXPIRES_IN          | 1d                                                                                                                                          |
| JWT_REFRESH_SECRET      | 204b928dd2f2cb93a3027499d2f3ad7dd074cd8117dc44bd2fd55113186befe20a88c2b0fcafbc54d0d4fdb32320786154b9d0422f9e5476f8bcb24f22d9f4c4         |
| JWT_REFRESH_EXPIRES_IN  | 7d                                                                                                                                          |

### Variables d'optimisation

| Variable          | Valeur                           |
|-------------------|----------------------------------|
| MEMORY_OPTIMIZED  | true                             |
| NODE_OPTIONS      | "--max-old-space-size=256"       |
| IS_RENDER         | false                            |
| RAILWAY_DEPLOYMENT| true                             |
| DISABLE_USER_SYNC | true                             |

### Variables de service email

| Variable          | Valeur                           |
|-------------------|----------------------------------|
| MAIL_HOST         | smtp.resend.com                  |
| MAIL_PORT         | 587                              |
| MAIL_SECURE       | true                             |
| MAIL_USER         | resend                           |
| MAIL_PASSWORD     | re_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q |
| MAIL_FROM         | onboarding@resend.dev            |
| MAIL_FROM_NAME    | NionFar                          |
| RESEND_API_KEY    | re_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q |

## Checklist de déploiement

1. **Vérifiez que toutes les variables d'environnement sont configurées**
   - Utilisez l'interface Railway ou la CLI Railway

2. **Vérifiez la configuration du build et du démarrage**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:railway`

3. **Redéployez l'application**
   - Via interface Railway: Cliquez sur "Redeploy"
   - Via CLI: `railway up`

4. **Surveillez les logs pour identifier les erreurs**
   - Via interface Railway: Onglet "Logs"
   - Via CLI: `railway logs`

5. **Vérifiez le statut de l'application**
   - Exécutez: `npm run check:railway`

## Dépannage

### Problème: L'application renvoie des erreurs 404

1. Vérifiez les logs pour confirmer que l'application a bien démarré
2. Assurez-vous que la variable PORT est bien définie à 3000
3. Vérifiez que la commande de démarrage est correcte
4. Assurez-vous que le build s'est bien terminé

### Problème: Erreur de connexion MongoDB

1. Vérifiez que l'URI MongoDB est correct
2. Assurez-vous que les identifiants MongoDB sont valides
3. Vérifiez que les adresses IP autorisées incluent les IPs Railway
4. Testez la connexion MongoDB manuellement

### Problème: Erreurs CORS

1. Assurez-vous que CORS_ALLOWED_ORIGINS inclut votre frontend
2. Vérifiez que FRONTEND_URL est configuré correctement

### Problème: L'application crash à cause de la mémoire

1. Augmentez la valeur dans NODE_OPTIONS (ex: --max-old-space-size=384)
2. Assurez-vous que MEMORY_OPTIMIZED est défini à true
3. Envisagez un plan Railway plus élevé si nécessaire

## Gestion du déploiement Render

Une fois que votre déploiement Railway fonctionne correctement:

1. **Mettez en pause Render sans supprimer**
   - Accédez au dashboard Render
   - Allez dans "Settings"
   - Cliquez sur "Suspend Service"

2. **Désactivez le déploiement automatique sur Render**
   - Allez dans "Deploy" > "Settings"
   - Désactivez "Auto Deploy"

3. **Vérifiez le bon fonctionnement pendant 1-2 semaines**
   - Si besoin de revenir en arrière, réactivez simplement votre service Render

4. **Migration complète**
   - Une fois certain de la stabilité, vous pourrez supprimer le service Render

## Ressources utiles

- [Documentation Railway](https://docs.railway.app/)
- [Dashboard Railway](https://railway.app/dashboard)
- [Documentation NestJS](https://docs.nestjs.com/)
- [Monitoring MongoDB Atlas](https://cloud.mongodb.com/) 