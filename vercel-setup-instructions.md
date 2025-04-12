# Configuration des déploiements Vercel via GitHub Actions

Ce document explique comment configurer les déploiements Vercel pour qu'ils soient déclenchés par GitHub Actions après que toutes les vérifications ont réussi.

## 1. Obtenir les tokens et identifiants Vercel

1. Connectez-vous à votre compte Vercel
2. Allez dans "Settings" > "Tokens"
3. Créez un nouveau token avec les permissions de déploiement
4. Notez le token, vous en aurez besoin pour les secrets GitHub

Pour obtenir les IDs d'organisation et de projet :
1. Allez sur votre tableau de bord Vercel
2. Ouvrez les paramètres du projet (frontend et backend)
3. Dans l'URL, vous verrez quelque chose comme : `https://vercel.com/[org-id]/[project-id]/settings`
4. Notez ces identifiants pour les deux projets

## 2. Ajouter les secrets GitHub

Allez dans les paramètres de votre dépôt GitHub :
1. "Settings" > "Secrets and variables" > "Actions"
2. Ajoutez les secrets suivants :

```
VERCEL_TOKEN=votre_token_vercel
VERCEL_ORG_ID=votre_id_organisation_vercel
VERCEL_PROJECT_ID_FRONTEND=id_projet_frontend
VERCEL_PROJECT_ID_BACKEND=id_projet_backend
```

## 3. Désactiver les déploiements automatiques sur Vercel

Pour les projets frontend et backend sur Vercel :
1. Allez dans "Settings" > "Git"
2. Désactivez "Auto Deployments" pour les branches principales (main, develop)

## 4. Valider que tout fonctionne

Après avoir configuré les secrets et désactivé les déploiements automatiques :
1. Faites un push sur la branche principale
2. Vérifiez que les GitHub Actions démarrent
3. Confirmez que les déploiements Vercel sont déclenchés uniquement après que toutes les vérifications sont passées

## 5. Résolution des problèmes

Si les déploiements ne fonctionnent pas :
1. Vérifiez les logs des GitHub Actions pour les erreurs
2. Assurez-vous que tous les secrets sont correctement configurés
3. Vérifiez que les identifiants Vercel sont corrects
4. Assurez-vous que les fichiers vercel.json sont correctement configurés 