import { Controller, Post, Body, HttpStatus, HttpException, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendService } from './resend.service';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly resendService: ResendService
  ) {}

  @Get('test-resend')
  async sendResendTest(@Query('email') email: string = 'badzagueye@gmail.com') {
    try {
      const result = await this.resendService.sendTestEmail(email);
      
      if (!result) {
        throw new Error('Échec de l\'envoi du mail de test');
      }

      return {
        success: true,
        message: 'Email de test Resend envoyé avec succès',
        id: result.id,
        to: email,
        config: {
          apiKey: !!process.env.RESEND_API_KEY,
          from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
          smtpHost: process.env.MAIL_HOST,
          smtpPort: process.env.MAIL_PORT,
          smtpSecure: process.env.MAIL_SECURE === 'true',
        }
      };
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'envoi de l'email de test: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test')
  async sendTestEmail(@Body() body: { email: string }) {
    try {
      const { email } = body;
      if (!email) {
        throw new HttpException('Email requis', HttpStatus.BAD_REQUEST);
      }

      const result = await this.resendService.sendEmail({
        to: email,
        subject: 'Test d\'envoi d\'email via Resend',
        html: `
          <h1>Test de Resend</h1>
          <p>Ceci est un email de test envoyé via Resend API.</p>
          <p>Si vous recevez cet email, cela signifie que votre configuration Resend fonctionne correctement.</p>
          <p>Merci de tester notre service!</p>
        `,
      });

      return {
        success: true,
        message: 'Email de test envoyé avec succès',
        id: result?.id,
      };
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'envoi de l'email de test: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('welcome')
  async sendWelcomeEmail(@Body() body: { email: string, firstName: string }) {
    try {
      const { email, firstName } = body;
      if (!email || !firstName) {
        throw new HttpException('Email et prénom requis', HttpStatus.BAD_REQUEST);
      }

      await this.emailService.sendWelcomeEmail(email, firstName);

      return {
        success: true,
        message: 'Email de bienvenue envoyé avec succès',
      };
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'envoi de l'email de bienvenue: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status')
  getEmailStatus() {
    return {
      resend: {
        enabled: true,
        apiKey: !!process.env.RESEND_API_KEY,
        defaultFrom: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
      },
      smtp: {
        configured: !!(
          process.env.MAIL_HOST && 
          process.env.MAIL_USER && 
          process.env.MAIL_PASSWORD
        ),
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_SECURE === 'true',
      }
    };
  }
} 