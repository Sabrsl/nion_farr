import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  template?: string;
  context?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
    
    // Vérifier la connexion au serveur SMTP au démarrage
    this.verifyConnection();
  }
  
  // Vérification de la connexion au serveur SMTP
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Connection au serveur SMTP établie avec succès');
    } catch (error) {
      this.logger.error('Erreur de connexion au serveur SMTP:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<void>;
  async sendEmail(to: string, subject: string, html: string): Promise<void>;
  async sendEmail(
    toOrOptions: string | EmailOptions,
    subject?: string,
    html?: string
  ): Promise<void> {
    try {
      if (typeof toOrOptions === 'string') {
        // Format ancien
        this.logger.debug(`Envoi d'email à ${toOrOptions}: ${subject}`);
        
        await this.transporter.sendMail({
          from: `"${this.configService.get<string>('EMAIL_FROM_NAME')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
          to: toOrOptions,
          subject,
          html,
        });
        
        this.logger.debug(`Email envoyé avec succès à ${toOrOptions}`);
      } else {
        // Format avec options
        const { to, subject, html: htmlContent, template, context } = toOrOptions;
        
        this.logger.debug(`Envoi d'email à ${to}: ${subject} (${template ? 'avec template' : 'sans template'})`);
        
        // TODO: implémenter le traitement des templates si nécessaire
        const finalHtml = htmlContent || `Template: ${template}, Context: ${JSON.stringify(context)}`;
        
        await this.transporter.sendMail({
          from: `"${this.configService.get<string>('EMAIL_FROM_NAME')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
          to,
          subject,
          html: finalHtml,
        });
        
        this.logger.debug(`Email envoyé avec succès à ${to}`);
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
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
    
    await this.sendEmail(to, subject, html);
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
    
    await this.sendEmail(to, subject, html);
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
    
    await this.sendEmail(to, subject, html);
  }
} 