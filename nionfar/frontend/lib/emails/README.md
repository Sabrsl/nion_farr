# Système d'Emails Automatisés pour Nionfar

Ce module gère l'envoi d'emails automatisés pour divers événements dans l'application Nionfar.

## Architecture

- **emailConfig.ts** : Configuration générale des emails (clés API, URL de base, etc.).
- **emailService.ts** : Service principal pour l'envoi d'emails via Resend.
- **emailSender.ts** : Interface pour envoyer des emails par type d'événement.
- **emailTemplates.ts** : Gestion des templates d'emails.
- **templates/** : Contient tous les templates d'emails par type d'événement.

## Intégration avec Resend

Nous utilisons [Resend](https://resend.com) comme fournisseur d'emails. Voici comment nous avons intégré les différentes fonctionnalités de l'API Resend :

### Envoi d'emails simples

```typescript
const result = await resend.emails.send({
  from: 'Nionfar <notifications@nionfar.sn>',
  to: ['utilisateur@example.com'],
  subject: 'Bienvenue sur Nionfar',
  html: '<p>Votre compte a été créé avec succès.</p>',
  text: 'Votre compte a été créé avec succès.'
});
```

### Envoi d'emails en lot (batch)

```typescript
const result = await resend.batch.send([
  {
    from: 'Nionfar <notifications@nionfar.sn>',
    to: ['utilisateur1@example.com'],
    subject: 'Notifications hebdomadaires',
    html: '<p>Vos notifications de la semaine</p>'
  },
  {
    from: 'Nionfar <notifications@nionfar.sn>',
    to: ['utilisateur2@example.com'],
    subject: 'Notifications hebdomadaires',
    html: '<p>Vos notifications de la semaine</p>'
  }
]);
```

### Suivi des emails envoyés

```typescript
// Récupérer le statut d'un email par son ID
const emailStatus = await resend.emails.get('email_id');
```

### Emails programmés

```typescript
// Programmer un email pour plus tard
const result = await resend.emails.send({
  from: 'Nionfar <notifications@nionfar.sn>',
  to: ['utilisateur@example.com'],
  subject: 'Rappel',
  html: '<p>Votre rappel programmé</p>',
  text: 'Votre rappel programmé',
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Dans 24h
});

// Mettre à jour la date d'un email programmé
await resend.emails.update({
  id: 'email_id',
  scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // Reprogrammer à 48h
});

// Annuler un email programmé
await resend.emails.cancel('email_id');
```

## API Points

### Endpoint global

- **POST /api/emails/send** : Endpoint générique pour envoyer des emails.

### Endpoints intégrés dans d'autres APIs

Certaines API utilisent également le service d'email :

- **POST /api/auth/register** : Envoie un email de vérification après inscription.
- **POST /api/auth/verify** : Envoie un email de bienvenue après vérification.
- **POST /api/auth/forgot-password** : Envoie un email de réinitialisation de mot de passe.
- **POST /api/orders/deliver** : Envoie une confirmation de livraison.

## Types d'Événements Supportés

Le système supporte les types d'événements suivants (définis dans `EmailEventType`) :

- `ORDER_CREATED` : Création d'une nouvelle commande
- `ORDER_ACCEPTED` : Acceptation d'une commande par le vendeur
- `ORDER_REJECTED` : Rejet d'une commande par le vendeur
- `ORDER_DELIVERED` : Livraison d'une commande
- `ORDER_COMPLETED` : Finalisation d'une commande
- `PAYMENT_RECEIVED` : Paiement reçu
- `PAYMENT_WITHDRAWAL` : Retrait de fonds
- `DISPUTE_OPENED` : Ouverture d'un litige
- `DISPUTE_RESOLVED` : Résolution d'un litige
- `NEW_MESSAGE` : Nouveau message reçu
- `ACCOUNT_CREATED` : Création de compte
- `PASSWORD_RESET` : Réinitialisation de mot de passe
- `ACCOUNT_VERIFICATION` : Vérification de compte
- `REVIEW_REMINDER` : Rappel pour laisser une évaluation
- `MESSAGE_DIGEST` : Résumé des messages non lus

## Utilisation

### Envoi d'emails via l'API

```typescript
// API Route
const response = await fetch('/api/emails/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'account_verification',
    recipient: {
      email: 'user@example.com',
      name: 'John Doe'
    },
    templateData: {
      userName: 'John',
      verificationCode: '123456'
    }
  })
});
```

### Utilisation directe dans le code serveur

```typescript
// Import de l'EmailManager
import { EmailManager } from 'lib/emails';

// Envoi d'un email de vérification de compte
await EmailManager.sendAccountVerification({
  to: 'user@example.com',
  userName: 'John Doe',
  verificationCode: '123456'
});

// Envoi d'un email de réinitialisation de mot de passe
await EmailManager.sendPasswordReset({
  to: 'user@example.com',
  userName: 'John Doe',
  resetLink: 'https://nionfar.sn/reset?token=abc123'
});
```

## Configuration

Pour configurer Resend, vous devez définir la variable d'environnement suivante :

```
RESEND_API_KEY=re_abcdefghijklmnopqrstuvwxyz
```

Il est recommandé d'utiliser des variables d'environnement différentes pour les environnements de développement, staging et production.

## Personnalisation des Templates

Tous les templates d'emails sont situés dans le dossier `templates/`. Chaque template exporte un objet qui implémente l'interface `EmailTemplate` :

```typescript
interface EmailTemplate {
  name: string;
  defaultSubject: string;
  render: (data: Record<string, any>) => {
    html: string;
    text: string;
  };
}
```

Pour ajouter un nouveau template, créez un nouveau fichier dans le dossier `templates/` et enregistrez-le dans `emailTemplates.ts`.

## Logs et Monitoring

Tous les envois d'emails sont journalisés dans la console, avec les succès et les échecs.

Dans une implémentation de production, vous pourriez vouloir ajouter :

- Un système de journalisation persistant (base de données, service de log)
- Des alertes en cas d'échec d'envoi
- Des statistiques d'envoi et d'ouverture
- Des webhooks pour traiter les rebonds et plaintes

## Extensions Futures

Voici quelques idées pour étendre le système d'emails :

- Ajout de tracking d'ouverture et de clics
- Intégration de tests A/B pour les templates
- Support multilingue pour les templates
- Interface d'administration pour prévisualiser et gérer les templates 