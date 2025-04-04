import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = twilio(accountSid, authToken);
  }

  async sendSms(to: string, body: string): Promise<void> {
    try {
      await this.client.messages.create({
        body,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
      });
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