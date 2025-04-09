import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as twilio from 'twilio';

interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  // private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    /*
    this.client = twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN')
    );
    */
    console.log('Service SMS initialisé en mode simulation');
  }

  async sendSms(options: SmsOptions): Promise<void>;
  async sendSms(to: string, body: string): Promise<void>;
  async sendSms(toOrOptions: string | SmsOptions, body?: string): Promise<void> {
    // Simulation d'envoi de SMS
    if (typeof toOrOptions === 'string') {
      console.log(`[SMS Simulation] Envoi à ${toOrOptions}: ${body}`);
    } else {
      console.log(`[SMS Simulation] Envoi à ${toOrOptions.to}: ${toOrOptions.message}`);
    }
    
    /*
    try {
      if (typeof toOrOptions === 'string') {
        // Legacy format
        await this.client.messages.create({
          body,
          from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
          to: toOrOptions,
        });
      } else {
        // New format with options object
        const { to, message } = toOrOptions;
        await this.client.messages.create({
          body: message,
          from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
          to,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      throw error;
    }
    */
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const message = `Votre code de vérification NionFar est: ${code}`;
    await this.sendSms(to, message);
  }
} 