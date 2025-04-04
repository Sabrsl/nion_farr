import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendNotification(userId: string, message: string): Promise<void> {
    // TODO: Implémenter la logique d'envoi de notification
    console.log(`Notification envoyée à l'utilisateur ${userId}: ${message}`);
  }
} 