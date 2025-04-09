import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationJob } from '../queue.service';

@Processor('notification')
export class NotificationQueueProcessor {
  private readonly logger = new Logger(NotificationQueueProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJob>): Promise<any> {
    try {
      this.logger.debug(`Traitement du job de notification #${job.id} - [${job.data.title}]`);
      
      // Mettre à jour la progression du job
      await job.progress(10);
      
      const { userId, title, message, type, metadata, sendEmail, sendSms } = job.data;
      
      // Créer la notification en base de données
      const notification = await this.notificationsService.create(userId, {
        title,
        message,
        type: type as any, // Conversion de type si nécessaire
        metadata: metadata || {},
      });
      
      // Mettre à jour la progression
      await job.progress(50);
      
      // Si demandé, envoyer également par email et/ou SMS
      if (sendEmail || sendSms) {
        await this.notificationsService.sendUserNotification(userId, {
          title,
          message,
          type: type as any,
          metadata: metadata || {},
        });
      }
      
      // Mise à jour finale de la progression
      await job.progress(100);
      
      this.logger.debug(`Notification envoyée avec succès: ${title} à l'utilisateur ${userId}`);
      
      return { success: true, notificationId: notification.id, userId };
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la notification [Job #${job.id}]:`, error);
      throw error;
    }
  }
} 