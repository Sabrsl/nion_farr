# Guide de nettoyage du code mort

Ce document décrit le processus recommandé pour nettoyer le code mort détecté par nos outils d'analyse (ts-prune, knip, depcheck).

## Priorités de nettoyage

1. **Priorité haute** : Exports non utilisés dans les fichiers utilitaires et de configuration
2. **Priorité moyenne** : Exports non utilisés dans les types, interfaces et types d'énumération
3. **Priorité basse** : Composants et hooks non utilisés qui pourraient être utilisés dans le futur

## Méthode de nettoyage recommandée

### 1. Analyse de l'export

Pour chaque export signalé comme non utilisé :
- Vérifier avec `grep` ou la recherche de l'IDE s'il est réellement utilisé
- Vérifier s'il est utilisé dans des imports dynamiques (non détectés par les outils)
- Vérifier s'il fait partie d'une API publique nécessaire

### 2. Ajout de commentaires de documentation

Pour les exports qui semblent non utilisés mais que vous souhaitez conserver :
```typescript
// @preserved: [raison de la préservation]
export const someFunction = () => { ... }
```

### 3. Nettoyage progressif

- **Étape 1** : Nettoyer les exports qui sont clairement non utilisés
- **Étape 2** : Retirer les extraneous dependencies (packages npm non utilisés)
- **Étape 3** : Nettoyer les fichiers entiers qui ne sont pas utilisés

### 4. Tester après chaque modification

- Exécuter les tests automatisés
- Vérifier le bon fonctionnement des fonctionnalités principales 
- Faire un build de production pour vérifier qu'il n'y a pas d'erreurs

## Exports sûrs à supprimer

Basé sur l'analyse, ces exports peuvent être supprimés sans risque :

### frontend/config.ts
- APP_NAME (remplacer par process.env.NEXT_PUBLIC_APP_NAME)
- DEFAULT_LANGUAGE (non utilisé)
- PRODUCTS_PER_PAGE (non utilisé)
- CURRENCY (non utilisé)
- IMAGE_PLACEHOLDER (non utilisé)
- AVATAR_PLACEHOLDER (non utilisé)
- REQUEST_TIMEOUT (non utilisé)

### frontend/data/index.ts
- Plusieurs exports de mock data non utilisés en production

### Types non utilisés dans frontend/types/index.ts
- NavItem
- FilterOptions
- Testimonial
- Plusieurs interfaces liées aux disputés et sécurité

## Dépendances npm non utilisées

D'après l'analyse de depcheck, ces packages peuvent être considérés pour suppression :
- @emotion/react, @emotion/styled (si MUI n'est pas utilisé activement)
- @tsparticles/* (si les effets de particules ne sont pas utilisés)
- concurrently (peut être gardé comme dépendance de développement)

## Note de prudence

Conserver une approche progressive et méthodique. Ne jamais supprimer de code en masse sans comprendre ses interconnexions. 