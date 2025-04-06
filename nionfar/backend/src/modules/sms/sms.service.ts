import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = new Twilio(accountSid, authToken);
  }

  async sendSms(options: SmsOptions): Promise<void>;
  async sendSms(to: string, body: string): Promise<void>;
  async sendSms(toOrOptions: string | SmsOptions, body?: string): Promise<void> {
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
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const message = `Votre code de vérification NionFar est: ${code}`;
    await this.sendSms(to, message);
  }
} 