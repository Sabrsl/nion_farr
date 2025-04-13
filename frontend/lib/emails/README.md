# Système d'Emails Automatisés pour Nionfar

## Note personnelle

Ce module est développé pour mon usage personnel et n'est pas destiné à être utilisé ou maintenu par d'autres personnes. Les fonctionnalités sont ajustées selon mes besoins spécifiques.

## Architecture

- **emailConfig.ts** : Configuration générale des emails (clés API, URL de base, etc.).
- **emailService.ts** : Service principal pour l'envoi d'emails via Resend.
- **emailSender.ts** : Interface pour envoyer des emails par type d'événement.
- **emailTemplates.ts** : Gestion des templates d'emails.
- **templates/** : Contient tous les templates d'emails par type d'événement.

## Intégration avec Resend

Le système utilise [Resend](https://resend.com) comme fournisseur d'emails.

## Types d'Événements Supportés

Le système supporte divers types d'événements (définis dans `EmailEventType`) comme :
- Création de compte
- Réinitialisation de mot de passe
- Vérification de compte
- Notifications de commandes
- Etc.

## Configuration

La configuration se fait via la variable d'environnement :
```
RESEND_API_KEY=re_xxxxx
``` 