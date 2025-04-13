import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface ResendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  text?: string;
  tags?: { name: string; value: string }[];
}

interface EmailResponse {
  id: string;
}

@Injectable()
export class ResendService {
  private readonly resend: Resend;
  private readonly logger = new Logger(ResendService.name);
  private readonly defaultFromEmail: string;
  private readonly defaultFromName: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY') || 're_a4PMNnRv_AByeDNM1QaHhFqWcHFrB5h2Q';
    this.defaultFromEmail = this.configService.get<string>('MAIL_FROM') || 'onboarding@resend.dev';
    this.defaultFromName = this.configService.get<string>('MAIL_FROM_NAME') || 'NionFar';
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('Service Resend initialisé avec succès');
    } else {
      this.logger.warn('RESEND_API_KEY non configurée - le service Resend fonctionnera en mode simulation');
      // Créer une instance de Resend avec une clé factice
      this.resend = new Resend('re_dummy_key_for_dev');
    }
  }

  /**
   * Envoie un email via Resend API
   */
  async sendEmail(options: ResendEmailOptions): Promise<EmailResponse | null> {
    try {
      const fromName = this.defaultFromName;
      const fromEmail = options.from || this.defaultFromEmail;
      const from = `${fromName} <${fromEmail}>`;
      
      // Journaliser en mode développement ou en mode simulation
      if (!this.isProduction || !this.configService.get<string>('RESEND_API_KEY')) {
        this.logger.debug(`[Resend] Envoi d'email à ${options.to}: ${options.subject}`);
        
        // En développement sans clé API valide, simuler l'envoi
        if (!this.configService.get<string>('RESEND_API_KEY')) {
          this.logger.log(`[SIMULATION] Email Resend à ${options.to}: ${options.subject}`);
          return { id: 'simulated-email-id' };
        }
      }
      
      // Configurer les options pour Resend
      const emailData = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        reply_to: options.replyTo,
        tags: options.tags,
      };
      
      // Envoyer l'email via Resend
      const { data, error } = await this.resend.emails.send(emailData);
      
      if (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email via Resend: ${error.message}`);
        return null;
      }
      
      this.logger.log(`Email envoyé via Resend, ID: ${data.id}`);
      return { id: data.id };
    } catch (error) {
      this.logger.error(`Exception lors de l'envoi de l'email via Resend:`, error);
      return null;
    }
  }

  /**
   * Envoie plusieurs emails en batch via Resend API
   */
  async sendBatch(emails: ResendEmailOptions[]): Promise<boolean> {
    try {
      if (!this.configService.get<string>('RESEND_API_KEY')) {
        this.logger.log(`[SIMULATION] Batch de ${emails.length} emails via Resend`);
        return true;
      }
      
      const formattedEmails = emails.map(email => {
        const fromName = this.defaultFromName;
        const fromEmail = email.from || this.defaultFromEmail;
        const from = `${fromName} <${fromEmail}>`;
        
        return {
          from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          cc: email.cc,
          bcc: email.bcc,
          reply_to: email.replyTo,
          tags: email.tags,
        };
      });
      
      const { data, error } = await this.resend.batch.send(formattedEmails);
      
      if (error) {
        this.logger.error(`Erreur lors de l'envoi batch via Resend: ${error.message}`);
        return false;
      }
      
      this.logger.log(`Batch de ${emails.length} emails envoyé via Resend`);
      return true;
    } catch (error) {
      this.logger.error(`Exception lors de l'envoi batch via Resend:`, error);
      return false;
    }
  }

  /**
   * Récupère les détails d'un email envoyé via Resend
   */
  async getEmailStatus(emailId: string) {
    try {
      const { data, error } = await this.resend.emails.get(emailId);
      
      if (error) {
        this.logger.error(`Erreur lors de la récupération du statut de l'email: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      this.logger.error(`Exception lors de la récupération du statut de l'email:`, error);
      return null;
    }
  }

  /**
   * Planifie l'envoi d'un email pour plus tard
   */
  async scheduleEmail(options: ResendEmailOptions, scheduledAt: Date): Promise<string | null> {
    try {
      if (!this.configService.get<string>('RESEND_API_KEY')) {
        this.logger.log(`[SIMULATION] Email planifié pour ${scheduledAt.toISOString()}`);
        return 'simulated-email-id';
      }
      
      const emailData = {
        from: options.from || this.defaultFromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        reply_to: options.replyTo,
        tags: options.tags,
        scheduled_at: scheduledAt.toISOString(),
      };
      
      const { data, error } = await this.resend.emails.send(emailData);
      
      if (error) {
        this.logger.error(`Erreur lors de la planification de l'email: ${error.message}`);
        return null;
      }
      
      this.logger.log(`Email planifié via Resend pour ${scheduledAt.toISOString()}, ID: ${data.id}`);
      return data.id;
    } catch (error) {
      this.logger.error(`Exception lors de la planification de l'email:`, error);
      return null;
    }
  }

  /**
   * Met à jour la date planifiée d'un email
   */
  async updateScheduledEmail(emailId: string, newScheduledAt: Date): Promise<boolean> {
    try {
      if (!this.configService.get<string>('RESEND_API_KEY')) {
        this.logger.log(`[SIMULATION] Planification de l'email ${emailId} mise à jour pour ${newScheduledAt.toISOString()}`);
        return true;
      }
      
      const { data, error } = await this.resend.emails.update({
        id: emailId,
        scheduledAt: newScheduledAt.toISOString(),
      });
      
      if (error) {
        this.logger.error(`Erreur lors de la mise à jour de la planification: ${error.message}`);
        return false;
      }
      
      this.logger.log(`Planification de l'email mise à jour, ID: ${data.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Exception lors de la mise à jour de la planification:`, error);
      return false;
    }
  }

  /**
   * Annule un email planifié
   */
  async cancelScheduledEmail(emailId: string): Promise<boolean> {
    try {
      if (!this.configService.get<string>('RESEND_API_KEY')) {
        this.logger.log(`[SIMULATION] Email planifié ${emailId} annulé`);
        return true;
      }
      
      const { data, error } = await this.resend.emails.cancel(emailId);
      
      if (error) {
        this.logger.error(`Erreur lors de l'annulation de l'email: ${error.message}`);
        return false;
      }
      
      this.logger.log(`Email planifié annulé, ID: ${data.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Exception lors de l'annulation de l'email:`, error);
      return false;
    }
  }

  /**
   * Envoie un email de vérification
   */
  async sendVerificationEmail(to: string, token: string): Promise<EmailResponse | null> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
    
    const subject = 'Vérification de votre adresse email';
    const html = `
      <h1>Vérification de votre adresse email</h1>
      <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
      <p><a href="${verificationUrl}">Vérifier mon email</a></p>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte sur Nionfar, vous pouvez ignorer cet email.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
    
    return this.sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'verification' }] });
  }
  
  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<EmailResponse | null> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
    
    const subject = 'Réinitialisation de votre mot de passe';
    const html = `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le lien ci-dessous :</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez nous contacter immédiatement.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
    
    return this.sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'password_reset' }] });
  }

  /**
   * Envoie un email de bienvenue
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<EmailResponse | null> {
    const subject = 'Bienvenue sur Nionfar';
    const html = `
      <h1>Bienvenue sur Nionfar, ${firstName}!</h1>
      <p>Nous sommes ravis de vous compter parmi nos membres.</p>
      <p>Vous pouvez maintenant explorer notre plateforme et découvrir nos services.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
    
    return this.sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'welcome' }] });
  }

  /**
   * Envoie un email de test
   */
  async sendTestEmail(to: string = 'badzagueye@gmail.com'): Promise<EmailResponse | null> {
    const subject = 'Test de votre configuration email Resend';
    const html = `
      <h1>Test de configuration email Resend</h1>
      <p>Ceci est un email de test pour vérifier votre configuration Resend.</p>
      <p>Si vous recevez cet email, cela signifie que votre configuration est correcte.</p>
      <p>Configuration utilisée:</p>
      <ul>
        <li>API Key: ${this.configService.get<string>('RESEND_API_KEY') ? 'Configurée' : 'Non configurée'}</li>
        <li>Expéditeur: ${this.defaultFromName} &lt;${this.defaultFromEmail}&gt;</li>
        <li>Destinataire: ${to}</li>
      </ul>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
    
    return this.sendEmail({ 
      to, 
      subject, 
      html, 
      tags: [
        { name: 'type', value: 'test' },
        { name: 'purpose', value: 'configuration' }
      ] 
    });
  }
} 