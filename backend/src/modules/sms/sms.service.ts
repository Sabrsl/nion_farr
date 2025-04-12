import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as twilio from 'twilio';

interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  // private client: twilio.Twilio;
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {
    // Désactivation temporaire de Twilio
    this.logger.log('Service SMS en mode simulation (Twilio désactivé)');
  }

  async sendSms(options: SmsOptions): Promise<void>;
  async sendSms(to: string, body: string): Promise<void>;
  async sendSms(toOrOptions: string | SmsOptions, body?: string): Promise<void> {
    try {
      // Mode simulation
      if (typeof toOrOptions === 'string') {
        this.logger.debug(`[SMS Simulation] Envoi à ${toOrOptions}: ${body}`);
      } else {
        this.logger.debug(`[SMS Simulation] Envoi à ${toOrOptions.to}: ${toOrOptions.message}`);
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi du SMS:', error);
      throw error;
    }
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const message = `Votre code de vérification NionFar est: ${code}. Ce code expirera dans 10 minutes.`;
    await this.sendSms(to, message);
  }
} 