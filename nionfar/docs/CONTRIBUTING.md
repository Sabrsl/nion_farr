# Guide de contribution à NionFar.sn

Merci de votre intérêt pour contribuer au projet NionFar.sn ! Ce document fournit des lignes directrices pour contribuer efficacement à notre plateforme.

## Comment contribuer

### Signaler des bugs

Si vous trouvez un bug :

1. Vérifiez d'abord que le bug n'a pas déjà été signalé dans les issues GitHub.
2. Créez une nouvelle issue avec un titre clair et descriptif.
3. Incluez :
   - Les étapes précises pour reproduire le bug
   - Le comportement attendu et ce qui se passe réellement
   - Des captures d'écran si possible
   - La version du navigateur et du système d'exploitation

### Proposer des améliorations

Pour proposer une nouvelle fonctionnalité ou une amélioration :

1. Créez une issue pour discuter de votre idée avant de commencer à coder.
2. Expliquez clairement le problème que votre fonctionnalité résoudrait.
3. Décrivez comment la fonctionnalité devrait fonctionner selon vous.

### Processus de Pull Request

1. Forkez le dépôt et créez votre branche à partir de `main`.
2. Si vous ajoutez du code, ajoutez des tests qui couvrent votre code.
3. Assurez-vous que tous les tests passent.
4. Assurez-vous que votre code respecte les conventions de style du projet.
5. Soumettez votre Pull Request !

## Standards de codage

### Style de code

- Suivez les conventions TypeScript déjà présentes dans le projet.
- Utilisez des noms de variables et de fonctions descriptifs.
- Commentez votre code lorsque c'est nécessaire pour en expliquer la logique.

### Commits

- Utilisez des messages de commit clairs et descriptifs.
- Commencez votre message de commit par un verbe à l'impératif : "Add", "Fix", "Update", etc.
- Référencez les numéros d'issues dans vos messages de commit lorsque c'est approprié.

### Tests

- Écrivez des tests pour tout nouveau code ou fonctionnalité.
- Assurez-vous que tous les tests existants passent avant de soumettre votre PR.

## Structure du projet

Veuillez respecter la structure du projet existante :

```
nionfar/
├── frontend/            # Application Next.js
│   ├── components/      # Composants React réutilisables
│   ├── data/            # Données statiques et mocks
│   ├── pages/           # Pages Next.js
│   ├── public/          # Actifs statiques (images, etc.)
│   ├── styles/          # Styles globaux
│   └── types/           # Types TypeScript
└── docs/                # Documentation
```

## Questions ?

Si vous avez des questions sur le processus de contribution, n'hésitez pas à nous contacter à contact@nionfar.sn.

Merci de contribuer à NionFar.sn ! 