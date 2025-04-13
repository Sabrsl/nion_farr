import { Resend } from 'resend';
import { EmailEventType, EMAIL_CONFIG, EmailRecipient } from './emailConfig';
import { getEmailTemplate, EmailTemplate } from './emailTemplates';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY || 'your_resend_api_key_here';
console.log('Initialisation de Resend avec clé:', resendApiKey ? 'Clé présente' : 'Clé manquante');
const resend = new Resend(resendApiKey);

// Interface pour les données d'événement
interface EventEmailData {
  recipient: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  templateData: Record<string, any>;
  customSubject?: string;
}

// Résultat d'envoi d'email
interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

// Interface pour les réponses de Resend
interface ResendResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
  // Autres propriétés...
}

// Service d'envoi d'emails
export const emailService = {
  /**
   * Envoie un email basé sur un événement
   * @param eventType Type d'événement
   * @param data Données pour le template et les destinataires
   */
  sendEventEmail: async (
    eventType: EmailEventType,
    data: EventEmailData
  ): Promise<EmailResult> => {
    console.log(`[EMAIL_SERVICE] Tentative d'envoi d'email pour l'événement ${eventType}`);
    const template = getEmailTemplate(eventType);
    
    if (!template) {
      console.error(`[EMAIL_SERVICE] No template found for event type: ${eventType}`);
      return { success: false, error: 'Template not found' };
    }
    
    try {
      const { recipient, cc, bcc, templateData, customSubject } = data;
      
      console.log(`[EMAIL_SERVICE] Préparation du contenu de l'email pour ${recipient.email} (type: ${eventType})`);
      
      try {
        // Render email content
        console.log(`[EMAIL_SERVICE] Tentative de rendu du template ${template.name}`);
        console.log(`[EMAIL_SERVICE] Données du template:`, JSON.stringify(templateData).substring(0, 100) + '...');
        
        const { html, text } = template.render(templateData);
        console.log(`[EMAIL_SERVICE] Rendu du template réussi - HTML: ${html.length} caractères, Text: ${text.length} caractères`);
        
        // Dans le mode test de Resend, nous devons utiliser la même adresse email comme expéditeur et destinataire
        // https://resend.com/docs/api-reference/rate-limits
        const isTestMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_');
        
        // Format recipient name if available
        const formattedRecipient = recipient.name 
          ? `${recipient.name} <${recipient.email}>`
          : recipient.email;
        
        // Toujours utiliser l'adresse Resend qui est vérifiée
        const formattedFrom = isTestMode
          ? `Nionfar Test <onboarding@resend.dev>`
          : (EMAIL_CONFIG.senderName 
              ? `${EMAIL_CONFIG.senderName} <${EMAIL_CONFIG.senderEmail}>`
              : EMAIL_CONFIG.senderEmail);

        console.log(`[EMAIL_SERVICE] Mode test Resend: ${isTestMode ? 'OUI' : 'NON'}`);
        console.log(`[EMAIL_SERVICE] From: ${formattedFrom}`);
        console.log(`[EMAIL_SERVICE] To: ${formattedRecipient}`);
        
        // Prepare CC and BCC if provided
        const formattedCc = cc?.map(r => r.name ? `${r.name} <${r.email}>` : r.email);
        const formattedBcc = bcc?.map(r => r.name ? `${r.name} <${r.email}>` : r.email);
        
        // Use custom subject if provided, otherwise use default from template
        const subject = customSubject || template.defaultSubject;
        
        console.log(`[EMAIL_SERVICE] Sujet: ${subject}`);
        
        // Debug de l'état de Resend
        if (!resend || !resend.emails) {
          console.error('[EMAIL_SERVICE] Resend n\'est pas correctement initialisé!');
          console.log('[EMAIL_SERVICE] Resend object:', resend ? 'Exists' : 'Undefined');
          console.log('[EMAIL_SERVICE] Resend emails API:', resend?.emails ? 'Exists' : 'Undefined');
          
          return { 
            success: false, 
            error: 'Resend client not properly initialized' 
          };
        }
        
        console.log(`[EMAIL_SERVICE] Appel de l'API Resend.emails.send...`);
        
        // Send email using Resend
        const payload = {
          from: formattedFrom,
          to: [formattedRecipient],
          ...(formattedCc?.length ? { cc: formattedCc } : {}),
          ...(formattedBcc?.length ? { bcc: formattedBcc } : {}),
          subject,
          html,
          text,
          tags: [
            {
              name: 'event_type',
              value: eventType
            }
          ]
        };
        
        console.log(`[EMAIL_SERVICE] Payload Resend:`, JSON.stringify({
          from: payload.from,
          to: payload.to,
          subject: payload.subject,
          htmlLength: payload.html.length,
          textLength: payload.text.length,
        }));
        
        const result = await resend.emails.send(payload);
        
        console.log('[EMAIL_SERVICE] Résultat brut de Resend:', JSON.stringify(result));
        
        if ('error' in result) {
          console.error('[EMAIL_SERVICE] Failed to send email via Resend:', result.error);
          return { 
            success: false, 
            error: result.error 
          };
        }
        
        // Assertion de type pour aider TypeScript à comprendre la structure
        const response = result as unknown as ResendResponse;
        console.log(`[EMAIL_SERVICE] Email sent successfully for event ${eventType}. ID: ${response.id}`);
        
        return { 
          success: true, 
          messageId: response.id 
        };
      } catch (templateError) {
        console.error('[EMAIL_SERVICE] Erreur lors du rendu du template ou de l\'envoi:', templateError);
        return {
          success: false,
          error: `Erreur de template: ${templateError}`
        };
      }
    } catch (error) {
      console.error('[EMAIL_SERVICE] Error sending email:', error);
      return { 
        success: false, 
        error 
      };
    }
  },
  
  /**
   * Récupérer le statut d'un email envoyé
   * @param messageId ID du message à vérifier
   */
  getEmailStatus: async (messageId: string): Promise<any> => {
    try {
      const result = await resend.emails.get(messageId);
      return result;
    } catch (error) {
      console.error('Error retrieving email status:', error);
      throw error;
    }
  },
  
  /**
   * Annuler un email programmé
   * @param messageId ID du message à annuler
   */
  cancelScheduledEmail: async (messageId: string): Promise<boolean> => {
    try {
      await resend.emails.cancel(messageId);
      return true;
    } catch (error) {
      console.error('Error canceling scheduled email:', error);
      return false;
    }
  },
  
  /**
   * Mettre à jour un email programmé
   * @param messageId ID du message
   * @param scheduledAt Nouvelle date programmée (ISO string)
   */
  updateScheduledEmail: async (messageId: string, scheduledAt: string): Promise<boolean> => {
    try {
      await resend.emails.update({
        id: messageId,
        scheduledAt
      });
      return true;
    } catch (error) {
      console.error('Error updating scheduled email:', error);
      return false;
    }
  },
  
  /**
   * Envoyer plusieurs emails en lot
   * @param emails Liste des emails à envoyer en batch
   */
  sendBatchEmails: async (emails: Array<{
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
  }>): Promise<any> => {
    try {
      const batch = emails.map(email => ({
        from: EMAIL_CONFIG.senderName 
          ? `${EMAIL_CONFIG.senderName} <${EMAIL_CONFIG.senderEmail}>`
          : EMAIL_CONFIG.senderEmail,
        ...email
      }));
      
      const result = await resend.batch.send(batch);
      return result;
    } catch (error) {
      console.error('Error sending batch emails:', error);
      throw error;
    }
  }
}; 