import { EmailEventType } from './emailConfig';
// Templates importés
// import { orderCreatedTemplate } from './templates/orderCreated';
import { orderAcceptedTemplate } from './templates/orderAccepted';
import { orderRejectedTemplate } from './templates/orderRejected';
// import { orderDeliveredTemplate } from './templates/orderDelivered';
import { orderCompletedTemplate } from './templates/orderCompleted';
// import { paymentReceivedTemplate } from './templates/paymentReceived';
import { paymentWithdrawalTemplate } from './templates/paymentWithdrawal';
import { disputeOpenedTemplate } from './templates/disputeOpened';
import { disputeResolvedTemplate } from './templates/disputeResolved';
import { newMessageTemplate } from './templates/newMessage';
import { accountCreatedTemplate } from './templates/accountCreated';
import { passwordResetTemplate } from './templates/passwordReset';
import { accountVerificationTemplate } from './templates/accountVerification';
import { reviewReminderTemplate } from './templates/reviewReminder';
import { messageDigestTemplate } from './templates/messageDigest';

/**
 * Interface pour les templates d'emails
 */
export interface EmailTemplate {
  name: string;
  defaultSubject: string;
  render: (data: any) => { html: string; text: string };
}

// Stockage des templates
const emailTemplates = new Map<string, EmailTemplate>();

// Register all email templates here
const templates: Partial<Record<EmailEventType, EmailTemplate>> = {
  // [EmailEventType.ORDER_CREATED]: orderCreatedTemplate,
  [EmailEventType.ORDER_ACCEPTED]: orderAcceptedTemplate,
  [EmailEventType.ORDER_REJECTED]: orderRejectedTemplate,
  // [EmailEventType.ORDER_DELIVERED]: orderDeliveredTemplate,
  [EmailEventType.ORDER_COMPLETED]: orderCompletedTemplate,
  // [EmailEventType.PAYMENT_RECEIVED]: paymentReceivedTemplate,
  [EmailEventType.PAYMENT_WITHDRAWAL]: paymentWithdrawalTemplate,
  [EmailEventType.DISPUTE_OPENED]: disputeOpenedTemplate,
  [EmailEventType.DISPUTE_RESOLVED]: disputeResolvedTemplate,
  [EmailEventType.NEW_MESSAGE]: newMessageTemplate,
  [EmailEventType.ACCOUNT_CREATED]: accountCreatedTemplate,
  [EmailEventType.PASSWORD_RESET]: passwordResetTemplate,
  [EmailEventType.ACCOUNT_VERIFICATION]: accountVerificationTemplate,
  [EmailEventType.REVIEW_REMINDER]: reviewReminderTemplate,
  [EmailEventType.MESSAGE_DIGEST]: messageDigestTemplate,
};

// Templates manquants - utiliser un template générique pour les tests
const missingTemplates = [
  EmailEventType.ORDER_CREATED,
  EmailEventType.ORDER_DELIVERED,
  EmailEventType.PAYMENT_RECEIVED
];

// Utiliser le template de vérification de compte comme fallback pour les templates manquants
missingTemplates.forEach(eventType => {
  if (!templates[eventType]) {
    console.log(`Utilisation du template de vérification comme fallback pour ${eventType}`);
    templates[eventType] = {
      ...accountVerificationTemplate,
      name: `generic-${eventType}`,
      defaultSubject: `Notification Nionfar: ${eventType.replace(/_/g, ' ')}`,
    };
  }
});

// Vérifie que les templates requis pour l'envoi de test sont disponibles
console.log('Templates disponibles:', Object.keys(templates).join(', '));
console.log('Vérification template:', templates[EmailEventType.ACCOUNT_VERIFICATION] ? 'OK' : 'MANQUANT');

/**
 * Enregistre un template d'email pour pouvoir l'utiliser par son nom
 */
export function registerEmailTemplate(template: EmailTemplate, templateName?: string): void {
  const templateId = templateName || template.name;
  
  if (emailTemplates.has(templateId)) {
    console.warn(`[EmailTemplates] Un template nommé "${templateId}" existe déjà et va être remplacé.`);
  }
  
  emailTemplates.set(templateId, template);
  console.log(`[EmailTemplates] Template "${templateId}" enregistré avec succès.`);
}

/**
 * Récupère un template d'email par son nom
 */
export function getEmailTemplate(templateName: string): EmailTemplate | null {
  const template = emailTemplates.get(templateName);
  
  if (!template) {
    console.error(`[EmailTemplates] Template "${templateName}" non trouvé.`);
    return null;
  }
  
  return template;
}

export default templates; 