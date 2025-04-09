import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly apiKey: string;
  private readonly defaultSender: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.defaultSender = this.configService.get<string>('EMAIL_SENDER') || 'Nionfar <onboarding@resend.dev>';
    
    if (!this.apiKey) {
      this.logger.error('RESEND_API_KEY n\'est pas défini dans les variables d\'environnement!');
    } else {
      this.logger.log('Service Resend initialisé avec succès');
    }
  }

  async sendEmail(options: ResendEmailOptions): Promise<{ id: string } | null> {
    try {
      if (!this.apiKey) {
        this.logger.error('Impossible d\'envoyer un email: RESEND_API_KEY n\'est pas défini');
        return null;
      }

      const { to, subject, html, from = this.defaultSender, ...rest } = options;

      this.logger.debug(`Envoi d'email via Resend à ${typeof to === 'string' ? to : to.join(', ')}: ${subject}`);

      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from,
          to,
          subject,
          html,
          ...rest
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      this.logger.debug(`Email envoyé avec succès via Resend, ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email via Resend:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<{ id: string } | null> {
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
  
  async sendPasswordResetEmail(to: string, token: string): Promise<{ id: string } | null> {
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

  async sendWelcomeEmail(to: string, firstName: string): Promise<{ id: string } | null> {
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
} 