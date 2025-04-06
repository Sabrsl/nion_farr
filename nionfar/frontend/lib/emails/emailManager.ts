import { Resend } from 'resend';
import { EMAIL_CONFIG, EmailEventType, EmailRecipient } from './emailConfig';
import { contactFormTemplate } from './templates/contactForm';
import { getEmailTemplate, registerEmailTemplate } from './emailTemplates';
import { createBaseHtmlTemplate, createBaseTextTemplate } from './templates/baseTemplate';

// Importation des templates
import { passwordResetTemplate } from './templates/passwordReset';
import { accountVerificationTemplate } from './templates/accountVerification';
import { orderAcceptedTemplate } from './templates/orderAccepted';

// Enregistrement des templates
registerEmailTemplate(passwordResetTemplate, EmailEventType.PASSWORD_RESET);
registerEmailTemplate(accountVerificationTemplate, EmailEventType.ACCOUNT_VERIFICATION);
registerEmailTemplate(orderAcceptedTemplate, EmailEventType.ORDER_ACCEPTED);
registerEmailTemplate(contactFormTemplate, 'CONTACT_FORM' as any);

/**
 * EmailManager fournit une interface unifiée pour l'envoi d'emails
 * avec gestion des erreurs et logs cohérents
 */
export class EmailManager {
  private static resend: Resend;
  private static initialized = false;

  /**
   * Initialise le gestionnaire d'emails avec la clé API
   */
  public static initialize(): void {
    if (this.initialized) return;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[EmailManager] Erreur d\'initialisation: Clé API Resend manquante');
      return;
    }

    this.resend = new Resend(apiKey);
    this.initialized = true;
    console.log('[EmailManager] Initialisé avec succès');
  }

  /**
   * Vérifie que le gestionnaire est initialisé
   */
  private static ensureInitialized(): boolean {
    if (!this.initialized) {
      this.initialize();
    }
    return this.initialized;
  }

  /**
   * Vérifie si un template est défini et valide avant de l'utiliser
   * pour éviter les erreurs lors du rendu côté serveur
   */
  private static validateTemplateRender(templateKey: EmailEventType, data: Record<string, any>): boolean {
    try {
      // Obtenir le template
      const template = getEmailTemplate(templateKey as any);
      
      if (!template || typeof template.render !== 'function') {
        console.error(`Le template ${templateKey} n'existe pas ou n'a pas de fonction render`);
        return false;
      }
      
      // Vérifier que le rendu ne produit pas d'erreur
      const { html, text } = template.render(data);
      return typeof html === 'string' && typeof text === 'string';
    } catch (error) {
      console.error(`Erreur lors du rendu du template ${templateKey}:`, error);
      return false;
    }
  }

  /**
   * Envoie un email avec un template
   */
  public static async sendTemplateEmail(
    templateKey: EmailEventType,
    toEmail: string | EmailRecipient,
    templateData: Record<string, any> = {},
    options: {
      subject?: string;
      cc?: string[];
      bcc?: string[];
    } = {}
  ): Promise<any> {
    try {
      if (!this.ensureInitialized()) {
        throw new Error('EmailManager non initialisé');
      }
      
      // Convertir EmailRecipient en string si nécessaire
      const recipientEmail = typeof toEmail === 'string' ? toEmail : toEmail.email;
      
      // Vérifier que le template est valide
      if (!this.validateTemplateRender(templateKey, templateData)) {
        throw new Error(`Template invalide pour ${templateKey}`);
      }
      
      // Obtenir le template
      const template = getEmailTemplate(templateKey as any);
      
      // Vérifier que le template existe
      if (!template) {
        throw new Error(`Template non trouvé pour ${templateKey}`);
      }
      
      // Rendre le contenu HTML et texte
      const { html, text } = template.render(templateData);
      
      // Préparer les options d'envoi
      const emailOptions = {
        from: EMAIL_CONFIG.defaultSender,
        to: [recipientEmail],
        subject: options.subject || template.defaultSubject,
        html,
        text,
        cc: options.cc,
        bcc: options.bcc
      };
      
      // Envoyer l'email via Resend
      const result = await this.resend.emails.send(emailOptions);
      
      // Logger le résultat
      console.log(`Email ${templateKey} envoyé à ${recipientEmail}:`, result);
      
      return result;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email ${templateKey}:`, error);
      throw error;
    }
  }

  /**
   * Envoie un email de contact
   */
  public static async sendContactEmail(
    data: {
      name: string;
      email: string;
      subject?: string;
      message: string;
      phoneNumber?: string;
      category?: string;
    }
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      if (!this.ensureInitialized()) {
        return { success: false, error: 'EmailManager non initialisé' };
      }

      const { name, email, subject, message, phoneNumber, category } = data;
      
      // Préparer les données pour le template
      const templateData = {
        senderName: name,
        senderEmail: email,
        subject: subject || 'Message depuis le formulaire de contact',
        message,
        phoneNumber: phoneNumber || '',
        category: category || 'non spécifiée'
      };

      // Adresse email de contact fixe
      const contactEmail = 'badzagueye@gmail.com';
      
      console.log('[EmailManager] Envoi de l\'email de contact à', contactEmail);

      // Générer le contenu de l'email
      const emailContent = contactFormTemplate.render(templateData);

      // Préparer le sujet personnalisé
      const emailSubject = `[Contact Nionfar] ${subject || 'Nouveau message'}`;

      // Toujours envoyer d'abord l'email de confirmation à l'expéditeur
      // pour s'assurer qu'il reçoit une confirmation, même si l'email principal échoue
      const confirmationResult = await this.sendContactConfirmation(data);
      
      if (!confirmationResult.success) {
        console.warn('[EmailManager] Échec de l\'envoi de la confirmation au contact:', confirmationResult.error);
        // On continue quand même avec l'email principal
      } else {
        console.log('[EmailManager] Email de confirmation envoyé avec succès à', email);
      }

      // Envoyer l'email à l'adresse de contact
      const result = await this.resend.emails.send({
        from: EMAIL_CONFIG.defaultSender,
        to: [contactEmail],
        subject: emailSubject,
        html: emailContent.html,
        text: emailContent.text,
        replyTo: email
      });
      
      if ('error' in result && result.error) {
        console.error('[EmailManager] Erreur lors de l\'envoi du formulaire de contact:', result.error);
        // Si la confirmation a réussi, on considère que c'est un succès partiel
        if (confirmationResult.success) {
          return { 
            success: true, 
            id: confirmationResult.id,
            error: {
              partialFailure: true,
              message: 'Email de confirmation envoyé mais échec de l\'envoi à l\'équipe'
            }
          };
        }
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        id: (result as any).id || confirmationResult.id
      };
    } catch (error) {
      console.error('[EmailManager] Exception lors de l\'envoi du formulaire de contact:', error);
      return { success: false, error };
    }
  }

  /**
   * Envoie un email de confirmation à l'expéditeur du formulaire de contact
   */
  private static async sendContactConfirmation(
    data: {
      name: string;
      email: string;
      subject?: string;
      message?: string;
      phoneNumber?: string;
      category?: string;
    }
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const { name, email, subject } = data;
      
      if (!email) {
        console.error('[EmailManager] Email manquant pour la confirmation');
        return { success: false, error: 'Email manquant' };
      }
      
      // Sujet de l'email de confirmation
      const confirmSubject = `Confirmation de votre message - Nionfar`;
      
      // Contenu HTML et texte pour le template de base
      const htmlContent = `
        <h1>Confirmation de réception</h1>
        <p>Bonjour ${name},</p>
        <p>Nous vous confirmons que votre message "${subject || 'sans objet'}" a bien été reçu par notre équipe.</p>
        <p>Nous vous répondrons dans les meilleurs délais.</p>
        <p>Cordialement,<br>L'équipe Nionfar</p>
      `;
      
      const textContent = `
        Confirmation de réception
        
        Bonjour ${name},
        
        Nous vous confirmons que votre message "${subject || 'sans objet'}" a bien été reçu par notre équipe.
        
        Nous vous répondrons dans les meilleurs délais.
        
        Cordialement,
        L'équipe Nionfar
      `;
      
      // Générer le contenu complet avec les templates de base
      const html = createBaseHtmlTemplate(htmlContent, "Confirmation de votre message");
      const text = createBaseTextTemplate(textContent, "Confirmation de votre message");
      
      console.log('[EmailManager] Tentative d\'envoi de confirmation à', email);
      
      // Envoyer l'email de confirmation
      const result = await this.resend.emails.send({
        from: EMAIL_CONFIG.defaultSender,
        to: [email],
        subject: confirmSubject,
        html,
        text
      });
      
      if ('error' in result && result.error) {
        console.error('[EmailManager] Erreur lors de l\'envoi de la confirmation:', result.error);
        return { success: false, error: result.error };
      }
      
      console.log('[EmailManager] Email de confirmation envoyé à', email);
      return { success: true, id: (result as any).id };
    } catch (error) {
      console.error('[EmailManager] Exception lors de l\'envoi de la confirmation:', error);
      return { success: false, error };
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  public static async sendPasswordReset(
    recipient: EmailRecipient | string,
    data: {
      userName: string;
      resetCode: string;
      resetLink: string;
      expirationTime: string;
    }
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    return this.sendTemplateEmail(
      EmailEventType.PASSWORD_RESET,
      recipient,
      data
    );
  }

  /**
   * Envoie un email de vérification de compte
   */
  public static async sendAccountVerification(
    recipient: EmailRecipient | string,
    data: {
      userName: string;
      verificationCode: string;
      verificationLink: string;
      expirationTime: string;
    }
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    return this.sendTemplateEmail(
      EmailEventType.ACCOUNT_VERIFICATION,
      recipient,
      data
    );
  }

  /**
   * Envoie un email pour une commande acceptée
   */
  public static async sendOrderAccepted(
    recipient: EmailRecipient | string,
    data: {
      clientName: string;
      orderId: string;
      orderDetails: {
        title: string;
        price: string;
        deadline: string;
      };
      sellerName: string;
      orderLink: string;
      nextSteps: string;
    }
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    return this.sendTemplateEmail(
      EmailEventType.ORDER_ACCEPTED,
      recipient,
      data
    );
  }
} 