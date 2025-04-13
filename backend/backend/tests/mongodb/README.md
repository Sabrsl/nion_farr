# Tests de connexion MongoDB pour NionFar

## Note personnelle

Ce module est développé pour mon usage personnel et n'est pas destiné à être utilisé ou maintenu par d'autres personnes. Les fonctionnalités sont ajustées selon mes besoins spécifiques.

## Contexte du problème

L'application NionFar rencontrait une erreur lors du déploiement sur Render :

```
MongoParseError: option batchsize is not supported
```

Cette erreur était causée par l'utilisation de l'option `batchSize` dans les options de connexion MongoDB, qui n'est pas prise en charge en tant que paramètre de chaîne de connexion.

## Solution

La solution a été de retirer l'option `batchSize` des options de connexion dans `backend/src/config/mongodb-memory-options.ts`.

## Tests disponibles

Ces tests permettent de vérifier que la connexion MongoDB fonctionne correctement après la correction.

1. **Validation de l'URI MongoDB** (`test-uri-parsing.js`)
   - Vérifie que l'URI MongoDB est correctement formaté
   - Détecte si le paramètre problématique `batchSize` est présent dans l'URI

2. **Connexion MongoDB basique** (`test-connection.js`)
   - Teste la connexion MongoDB avec des options basiques
   - Utilise Mongoose pour la connexion

3. **Connexion MongoDB directe** (`test-direct-connection.js`)
   - Teste la connexion directe avec le driver MongoDB natif
   - Sans utiliser Mongoose

4. **Connexion MongoDB style NestJS** (`test-nestjs-connection.js`)
   - Simule la manière dont NestJS se connecte à MongoDB
   - Reproduit le comportement de l'application en production

5. **Exécution de tous les tests** (`run-all-tests.js`)
   - Exécute tous les tests en séquence
   - Fournit un rapport détaillé des résultats

## Prérequis

Avant d'exécuter les tests, assurez-vous d'avoir :

1. Un fichier `.env` contenant `MONGODB_URI=votre_uri_mongodb`
2. Node.js installé (version 14 ou supérieure recommandée)
3. Les dépendances installées via `npm install`

## Comment exécuter les tests

### Installation

```bash
cd backend/tests/mongodb
npm install
```

### Exécuter tous les tests

```bash
npm test
```

### Exécuter des tests spécifiques

```bash
# Test de validation de l'URI
npm run test:uri

# Test de connexion basique
npm run test:basic

# Test de connexion directe
npm run test:direct

# Test de connexion style NestJS
npm run test:nestjs
```

## Interprétation des résultats

- ✅ **Tests réussis** : La connexion MongoDB est correctement configurée et devrait fonctionner sur Render.
- ❌ **Échec des tests** : Des problèmes doivent être résolus avant le déploiement sur Render.

## Recommandations après les tests

### Si tous les tests réussissent

1. Déployez votre application sur Render
2. Vérifiez les logs de déploiement pour confirmer que la connexion MongoDB fonctionne
3. Testez que votre application fonctionne correctement après le déploiement

### Si certains tests échouent

1. Vérifiez votre chaîne de connexion MongoDB (MONGODB_URI)
2. Assurez-vous que le serveur MongoDB est accessible
3. Vérifiez que les options de connexion sont valides
4. Si l'erreur persiste, consultez les logs d'erreur pour plus de détails

## Support

Pour plus d'informations, consultez la documentation :
- [Documentation MongoDB](https://docs.mongodb.com/)
- [Documentation Mongoose](https://mongoosejs.com/docs/guide.html)
- [Documentation NestJS](https://docs.nestjs.com/techniques/mongodb) 