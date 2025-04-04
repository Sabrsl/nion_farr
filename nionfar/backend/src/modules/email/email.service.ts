import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"${this.configService.get<string>('EMAIL_FROM_NAME')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
      to,
      subject,
      html,
    });
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