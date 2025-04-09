# Nionfar Frontend

## Déploiement sur Vercel

Pour déployer l'application frontend sur Vercel, suivez ces étapes:

### Prérequis
- Un compte [Vercel](https://vercel.com)
- Le code source déployé sur GitHub/GitLab/Bitbucket

### Étapes de déploiement

1. **Connectez-vous à Vercel** et importez votre projet depuis GitHub.

2. **Configuration du projet**:
   - Framework preset: NextJS
   - Root Directory: nionfar/frontend
   - Build Command: Laissez vide (la configuration est dans vercel.json)
   - Output Directory: Laissez vide (la configuration est dans vercel.json)
   - Install Command: Laissez vide (la configuration est dans vercel.json)

3. **Variables d'environnement**:
   Les variables suivantes doivent être configurées dans l'interface Vercel (Settings > Environment Variables):

   ```
   NEXTAUTH_SECRET=<générer une chaîne aléatoire sécurisée>
   MONGODB_URI=<votre chaîne de connexion MongoDB>
   STRIPE_SECRET_KEY=<votre clé secrète Stripe>
   EMAIL_SERVER_PASSWORD=<votre clé API d'email>
   CLOUDINARY_API_SECRET=<votre secret API Cloudinary>
   ```
   
   Pour générer une chaîne sécurisée pour NEXTAUTH_SECRET, utilisez la commande:
   ```bash
   node -e "console.log(crypto.randomBytes(32).toString('hex'))"
   ```

4. **Domaine personnalisé** (Optionnel):
   - Accédez à la section "Domains" dans les paramètres du projet
   - Ajoutez votre domaine personnalisé et suivez les instructions pour configurer les DNS

### Surveillance et maintenance

Une fois déployé, vous pouvez surveiller votre application via le tableau de bord Vercel:
- **Analytics**: Mesures de performance et d'utilisation
- **Logs**: Journaux d'exécution pour le débogage
- **Deployments**: Historique des déploiements avec possibilité de revenir à une version précédente

### Configuration des webhooks (optionnel)

Pour déclencher des builds automatiquement lors des modifications dans des services externes:
1. Accédez à Settings > Git > Deploy Hooks
2. Créez un webhook et utilisez l'URL générée dans vos services externes

### Dépannage courant

- **Erreurs de build**: Vérifiez les logs de build sur Vercel
- **Problèmes CORS**: Assurez-vous que le backend autorise les requêtes depuis le domaine Vercel
- **Variables d'environnement manquantes**: Vérifiez que toutes les variables requises sont configurées

### Test de l'application après déploiement

Après le déploiement, testez les fonctionnalités suivantes:
- Authentification
- Upload d'images
- Connexion API avec le backend
- Formulaires et soumissions de données 

### Sécurité

- Ne stockez jamais de secrets, clés API ou tokens dans le code source
- Utilisez exclusivement les variables d'environnement de Vercel pour les informations sensibles
- Activez l'authentification à deux facteurs pour votre compte Vercel
- Vérifiez régulièrement les journaux d'accès et d'activité 