# Guide pour désactiver proprement Render

Ce document détaille les étapes à suivre pour désactiver correctement votre déploiement Render après avoir migré vers Railway, tout en gardant la possibilité de revenir en arrière si nécessaire.

## Préparation avant désactivation

1. **Vérifier que Railway fonctionne correctement**

   Avant de désactiver Render, assurez-vous que votre application fonctionne correctement sur Railway :

   ```bash
   # Vérifier la configuration Railway
   npm run check:railway
   
   # Vérifier les variables d'environnement Railway
   npm run check:railway-env
   
   # Valider que les endpoints d'API fonctionnent
   npm run validate:railway
   ```

2. **Sauvegarder les variables d'environnement de Render**

   Créez une sauvegarde de toutes les variables d'environnement actuellement configurées sur Render :

   ```bash
   npm run export:render-env
   ```

   Cela créera un fichier `render-env-export.txt` contenant toutes les variables d'environnement.

3. **Faire une sauvegarde complète des données**

   ```bash
   npm run backup:before-migration
   ```

## Désactivation de Render

1. **Suspendre le service sans le supprimer**

   - Accédez à votre dashboard Render
   - Cliquez sur votre service backend
   - Allez dans l'onglet "Settings"
   - Faites défiler jusqu'à la "Danger Zone"
   - Cliquez sur "Suspend Service"
   - Confirmez l'action

   Cette action arrête le service sans supprimer aucune configuration ni donnée.

2. **Désactiver les déploiements automatiques**

   - Dans l'interface Render, allez dans "Deploy" > "Settings"
   - Trouvez la section "Auto Deploy"
   - Désactivez le toggle "Auto Deploy from GitHub"
   - Cliquez sur "Save Changes"

   Cela empêchera les déploiements automatiques pendant que vous utilisez Railway.

3. **Vérifier que vous pouvez toujours accéder au dashboard**

   Assurez-vous de pouvoir toujours accéder au dashboard Render et aux paramètres du service, même après l'avoir suspendu.

## Conservation des configurations pour rollback possible

1. **Ne pas supprimer le service**

   Il est important de ne pas supprimer le service Render, mais simplement de le suspendre. Cela vous permettra de le réactiver facilement si nécessaire.

2. **Conserver les credentials et fichiers de configuration**

   - Gardez précieusement le fichier `render-env-export.txt`
   - Conservez les fichiers de configuration Render (`render.yaml`, `render-build.sh`)

## Revenir à Render en cas de besoin

Si vous avez besoin de revenir à Render, suivez ces étapes :

1. **Réactiver le service**

   - Accédez à votre dashboard Render
   - Cliquez sur "Resume Service" pour réactiver votre service

2. **Vérifier les variables d'environnement**

   Assurez-vous que toutes les variables d'environnement sont bien configurées en comparant avec votre sauvegarde.

3. **Réactiver les déploiements automatiques**

   Si vous le souhaitez, vous pouvez réactiver les déploiements automatiques depuis GitHub.

4. **Basculer le trafic**

   Si vous utilisez un domaine personnalisé, modifiez les paramètres DNS pour rediriger le trafic vers Render plutôt que Railway.

## Considérations pour la migration

- La suspension du service Render arrête la facturation pour le service, mais pas pour les autres ressources comme les bases de données.
- Vérifiez également les éventuelles bases de données ou services associés à votre projet sur Render.
- Suivez les performances sur Railway pour déterminer si les ressources allouées sont suffisantes.

## Liste de vérification finale

- [x] Vérifier le déploiement sur Railway
- [ ] Sauvegarder les variables d'environnement Render
- [ ] Faire une sauvegarde complète des données
- [ ] Suspendre le service Render
- [ ] Désactiver les déploiements automatiques sur Render
- [ ] Vérifier le bon fonctionnement sur Railway pendant au moins une semaine
- [ ] Après une période de stabilité, envisager la suppression du service Render 