import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { UserRole } from '../users/enums/user-role.enum';

interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private usersService: UsersService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  /**
   * Créer une notification pour un utilisateur
   */
  async create(userId: string, payload: NotificationPayload): Promise<Notification> {
    const newNotification = new this.notificationModel({
      user: new Types.ObjectId(userId),
      title: payload.title,
      message: payload.message,
      type: payload.type,
      metadata: payload.metadata || {},
      isRead: false,
      isActive: true,
    });

    return newNotification.save();
  }

  /**
   * Récupérer toutes les notifications d'un utilisateur
   */
  async findAllForUser(userId: string, isRead?: boolean): Promise<Notification[]> {
    const query: any = { user: new Types.ObjectId(userId), isActive: true };
    
    if (isRead !== undefined) {
      query.isRead = isRead;
    }
    
    return this.notificationModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      user: new Types.ObjectId(userId)
    });
    
    if (!notification) {
      throw new Error('Notification non trouvée');
    }
    
    notification.isRead = true;
    return notification.save();
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { user: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
  }

  /**
   * Supprimer une notification (soft delete)
   */
  async remove(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: notificationId, user: new Types.ObjectId(userId) },
      { $set: { isActive: false } }
    );
  }

  /**
   * Nombre de notifications non lues d'un utilisateur
   */
  async countUnread(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      user: new Types.ObjectId(userId),
      isRead: false,
      isActive: true
    });
  }

  /**
   * Envoyer une notification à un utilisateur (avec email/SMS si configuré)
   */
  async sendUserNotification(userId: string, payload: NotificationPayload): Promise<Notification> {
    try {
      // Créer la notification dans la base de données
      const notification = await this.create(userId, payload);
      
      // Récupérer les préférences de notification de l'utilisateur
      const user = await this.usersService.findOne(userId);
      
      // Envoyer un email si l'utilisateur a activé les notifications par email
      if (user.notificationPreferences?.email) {
        // Déterminer le template en fonction du type de notification
        const emailTemplateMap: Record<string, string> = {
          [NotificationType.ORDER_CREATED]: 'order-created',
          [NotificationType.ORDER_ACCEPTED]: 'order-accepted',
          [NotificationType.ORDER_REJECTED]: 'order-rejected',
          [NotificationType.ORDER_DELIVERED]: 'order-delivered',
          [NotificationType.DISPUTE_CREATED]: 'dispute-created',
          [NotificationType.DISPUTE_UPDATED]: 'dispute-updated',
          [NotificationType.NEW_MESSAGE]: 'new-message',
          // ... autres types
        };
        
        const template = emailTemplateMap[payload.type] || 'notification';
        
        // Envoyer l'email
        await this.emailService.sendEmail({
          to: user.email,
          subject: payload.title,
          template,
          context: {
            firstName: user.firstName,
            message: payload.message,
            ...payload.metadata
          }
        });
      }
      
      // Envoyer un SMS si l'utilisateur a activé les notifications par SMS
      if (user.notificationPreferences?.sms && user.phone) {
        await this.smsService.sendSms({
          to: user.phone,
          message: `${payload.title} - ${payload.message}`
        });
      }
      
      return notification;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      throw error;
    }
  }

  /**
   * Envoyer une notification à tous les administrateurs
   */
  async sendAdminNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Récupérer tous les administrateurs
      const admins = await this.usersService.findByRole(UserRole.ADMIN);
      
      // Envoyer une notification à chaque admin
      for (const admin of admins) {
        await this.sendUserNotification(admin.id, payload);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification aux administrateurs:', error);
      throw error;
    }
  }
} 