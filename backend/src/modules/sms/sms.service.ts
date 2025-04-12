import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {
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
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const message = `Votre code de vérification NionFar est: ${code}`;
    await this.sendSms(to, message);
  }
} 