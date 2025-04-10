# Checklist de migration vers Railway

## Fichiers créés ou modifiés

- [x] `.env.railway` - Fichier de configuration pour Railway
- [x] `railway.toml` - Fichier de configuration pour le déploiement Railway
- [x] `src/config/environment.ts` - Ajout de la détection de l'environnement Railway
- [x] `scripts/prepare-railway.js` - Script de préparation de la migration
- [x] `scripts/validate-railway.js` - Script de validation du déploiement Railway
- [x] `MIGRATION-RAILWAY.md` - Documentation détaillée du processus de migration
- [x] `package.json` - Ajout des scripts pour la migration

## URL de déploiement

- **URL Railway actuelle**: https://nionfar.up.railway.app
- **API endpoint de test**: https://nionfar.up.railway.app/api/services/categories/count

## Étapes à suivre

### Phase 1: Préparation (sur votre machine locale)

- [ ] Exécuter `git pull` pour récupérer les dernières modifications
- [ ] Exécuter `npm install` pour installer les dépendances
- [ ] Exécuter `npm run build` pour vérifier que le build fonctionne
- [ ] Exécuter `npm run export:render-env` pour sauvegarder les variables d'environnement Render
- [ ] Exécuter `npm run backup:before-migration` pour créer une sauvegarde de la base de données
- [ ] Copier et personnaliser le fichier `.env.railway` avec les valeurs réelles de vos variables d'environnement
- [ ] Exécuter `npm run prepare:railway` pour vérifier que tout est prêt

### Phase 2: Configuration Railway

- [ ] Créer un compte Railway si ce n'est pas déjà fait
- [ ] Installer la CLI Railway (`npm install -g @railway/cli`)
- [ ] Se connecter à Railway (`railway login`)
- [ ] Créer un nouveau projet Railway
- [ ] Lier votre projet GitHub à Railway
- [ ] Importer les variables d'environnement depuis `.env.railway`
- [ ] Configurer le build command: `npm install && npm run build`
- [ ] Configurer le start command: `npm run start:railway`
- [ ] Vérifier la configuration MongoDB URI

### Phase 3: Déploiement et validation

- [ ] Déclencher un déploiement sur Railway
- [ ] Attendre que le déploiement soit terminé avec succès
- [ ] Récupérer l'URL du service déployé (https://nionfar.up.railway.app)
- [ ] Exécuter `npm run validate:railway` et suivre les instructions
- [ ] Vérifier manuellement l'API avec Postman ou un outil similaire
- [ ] Vérifier que l'endpoint `/api/services/categories/count` fonctionne correctement
- [ ] Vérifier les logs Railway pour détecter d'éventuels problèmes

### Phase 4: Transition progressive

- [ ] Tester le frontend avec la nouvelle API Railway
- [ ] Garder Render actif pendant la phase de test
- [ ] Surveiller les performances et les erreurs
- [ ] Si un domaine personnalisé est utilisé, préparer le changement de DNS
- [ ] Après une période de test satisfaisante, rediriger le trafic vers Railway
- [ ] Mettre Render en pause (ne pas le supprimer)

### Phase 5: Finalisation (après 1-2 semaines de stabilité)

- [ ] Vérifier qu'il n'y a pas d'erreurs ou de problèmes
- [ ] Optimiser la configuration selon les besoins
- [ ] Envisager un plan payant si nécessaire
- [ ] Supprimer définitivement l'instance Render si tout fonctionne parfaitement

## Points d'attention

- **MongoDB**: Assurez-vous que la connexion MongoDB fonctionne et que vous utilisez la même base de données
- **JWT Secrets**: Utilisez les mêmes secrets JWT pour garantir la continuité des sessions utilisateurs
- **CORS**: Vérifiez que la configuration CORS autorise les bonnes origines
- **Ressources**: Surveillez l'utilisation des ressources (CPU, mémoire) sur Railway

## Rollback en cas de problème

- [ ] Réactiver l'instance Render
- [ ] Restaurer les DNS vers Render si modifiés
- [ ] Diagnostiquer et corriger les problèmes sur Railway
- [ ] Réessayer le déploiement après correction 