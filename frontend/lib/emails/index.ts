/**
 * Système d'emails automatisés - Nionfar
 * Point d'entrée central pour importer les différents services et types liés aux emails
 */

// Export des configurations
export * from './emailConfig';

// Export des services de base
export { emailService } from './emailService';
export { emailSender } from './emailSender';

// Export des fonctions et types liés aux templates
export { getEmailTemplate, registerEmailTemplate } from './emailTemplates';
export type { EmailTemplate } from './emailTemplates';

// Export des templates de base
export { 
  createBaseHtmlTemplate, 
  createBaseTextTemplate 
} from './templates/baseTemplate';

// Export du gestionnaire d'emails comme export par défaut
export { EmailManager } from './emailManager'; 