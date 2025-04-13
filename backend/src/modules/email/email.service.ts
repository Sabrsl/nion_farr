import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ResendService } from './resend.service';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  template?: string;
  context?: Record<string, any>;
}

type TransporterOptions = nodemailer.TransportOptions & {
  jsonTransport?: boolean;
};

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly isProduction: boolean;
  private readonly useResend: boolean;

  constructor(
    private configService: ConfigService,
    private resendService: ResendService
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.useResend = this.configService.get<string>('USE_RESEND') === 'true' || this.isProduction;
    
    if (this.useResend) {
      this.logger.log('Service email configuré pour utiliser Resend API');
    }
    
    // Configuration du transporteur Nodemailer de secours
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = this.configService.get<number>('EMAIL_PORT') || 587;
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const emailSecure = this.configService.get<boolean>('EMAIL_SECURE') || false;
    
    // Validation des configurations
    const hasValidEmailConfig = emailHost && emailUser && emailPassword;
    
    if (!hasValidEmailConfig) {
      this.logger.warn('Configuration email incomplète - création d\'un transporteur factice');
      // Créer un transporteur factice qui journalise mais n'envoie pas
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      } as TransporterOptions);
    } else {
      // Configuration standard avec gestion plus robuste des erreurs
      try {
        this.logger.log(`Configuration du service email avec le serveur ${emailHost}:${emailPort}`);
        this.transporter = nodemailer.createTransport({
          host: emailHost,
          port: emailPort,
          secure: emailSecure,
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
          // Ajouter un timeout pour éviter les blocages
          connectionTimeout: 10000, // 10 secondes
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
        
        // Vérifier la connexion au serveur SMTP seulement en développement et si Resend n'est pas utilisé
        if (!this.isProduction && !this.useResend) {
          this.verifyConnection();
        }
      } catch (error) {
        this.logger.error('Erreur lors de la création du transporteur email:', error);
        // Fallback en cas d'erreur
        this.transporter = nodemailer.createTransport({
          jsonTransport: true
        } as TransporterOptions);
      }
    }
  }
  
  // Vérification de la connexion au serveur SMTP
  private async verifyConnection(): Promise<void> {
    try {
      const options = this.transporter.options as TransporterOptions;
      if (options.jsonTransport) {
        this.logger.warn('Transporteur factice - vérification SMTP ignorée');
        return;
      }
      
      await this.transporter.verify();
      this.logger.log('Connexion au serveur SMTP établie avec succès');
    } catch (error) {
      this.logger.error('Erreur de connexion au serveur SMTP:', error);
      // Ne pas faire échouer l'application en cas d'erreur SMTP
    }
  }

  // Méthode pour envoyer un email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Utiliser Resend API si configuré
    if (this.useResend) {
      try {
        const result = await this.resendService.sendEmail({
          to: options.to,
          subject: options.subject,
          html: options.html || '',
        });
        
        return !!result;
      } catch (error) {
        this.logger.error('Erreur lors de l\'envoi via Resend, tentative via SMTP:', error);
        // Continuer avec le transporteur SMTP en cas d'échec
      }
    }
    
    // Fallback vers Nodemailer
    try {
      const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@nionfar.com';
      
      const mailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };
      
      // Journaliser en mode développement
      if (!this.isProduction) {
        this.logger.debug(`Envoi d'email à ${options.to}: ${options.subject}`);
      }
      
      const transporterOptions = this.transporter.options as TransporterOptions;
      if (transporterOptions.jsonTransport) {
        // Simuler l'envoi en mode factice
        this.logger.log(`[SIMULATION] Email à ${options.to}: ${options.subject}`);
        return true;
      }
      
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email envoyé à ${options.to}, ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${options.to}:`, error);
      // Ne pas faire échouer l'application en cas d'erreur d'envoi
      return false;
    }
  }
  
  /**
   * Envoie un email de bienvenue
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const subject = 'Bienvenue sur Nionfar';
    const html = `
      <h1>Bienvenue sur Nionfar, ${firstName}!</h1>
      <p>Nous sommes ravis de vous compter parmi nos membres.</p>
      <p>Vous pouvez maintenant explorer notre plateforme et découvrir nos services.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
    
    await this.sendEmail({ to, subject, html });
  }
  
  /**
   * Envoie un email de vérification
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
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
    
    await this.sendEmail({ to, subject, html });
  }
  
  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
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
    
    await this.sendEmail({ to, subject, html });
  }
} 