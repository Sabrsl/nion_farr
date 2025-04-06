import { Injectable } from '@nestjs/common';
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
  }

  async sendEmail(options: EmailOptions): Promise<void>;
  async sendEmail(to: string, subject: string, html: string): Promise<void>;
  async sendEmail(
    toOrOptions: string | EmailOptions,
    subject?: string,
    html?: string
  ): Promise<void> {
    if (typeof toOrOptions === 'string') {
      // Legacy format
      await this.transporter.sendMail({
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to: toOrOptions,
        subject,
        html,
      });
    } else {
      // New format with options object
      const { to, subject, html: htmlContent, template, context } = toOrOptions;
      
      // TODO: implement template handling if needed
      const finalHtml = htmlContent || `Template: ${template}, Context: ${JSON.stringify(context)}`;
      
      await this.transporter.sendMail({
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to,
        subject,
        html: finalHtml,
      });
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    
    const html = `
      <h1>Vérifiez votre adresse email</h1>
      <p>Merci de vous être inscrit sur NionFar. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
      <a href="${verificationUrl}">Vérifier mon email</a>
    `;
    
    await this.sendEmail(to, 'Vérification de votre adresse email - NionFar', html);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    
    const html = `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
      <p>Si vous n'avez pas demandé la réinitialisation de votre mot de passe, veuillez ignorer cet email.</p>
    `;
    
    await this.sendEmail(to, 'Réinitialisation de votre mot de passe - NionFar', html);
  }
} 