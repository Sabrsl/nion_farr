import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(NotificationsService.name);
  
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
    this.logger.debug(`Création d'une notification pour l'utilisateur ${userId}: ${payload.title}`);
    
    const newNotification = new this.notificationModel({
      user: new Types.ObjectId(userId),
      title: payload.title,
      message: payload.message,
      type: payload.type,
      metadata: payload.metadata || {},
      isRead: false,
      isActive: true,
    });

    const savedNotification = await newNotification.save();
    this.logger.debug(`Notification créée avec succès: ${savedNotification.id}`);
    
    return savedNotification;
  }

  /**
   * Récupérer toutes les notifications d'un utilisateur
   */
  async findAllForUser(userId: string, isRead?: boolean): Promise<Notification[]> {
    const query: any = { user: new Types.ObjectId(userId), isActive: true };
    
    if (isRead !== undefined) {
      query.isRead = isRead;
    }
    
    this.logger.debug(`Récupération des notifications pour l'utilisateur ${userId} - Filtre isRead: ${isRead}`);
    
    return this.notificationModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    this.logger.debug(`Marquage de la notification ${notificationId} comme lue pour l'utilisateur ${userId}`);
    
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      user: new Types.ObjectId(userId)
    });
    
    if (!notification) {
      this.logger.warn(`Notification ${notificationId} non trouvée pour l'utilisateur ${userId}`);
      throw new Error('Notification non trouvée');
    }
    
    notification.isRead = true;
    return notification.save();
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    this.logger.debug(`Marquage de toutes les notifications comme lues pour l'utilisateur ${userId}`);
    
    await this.notificationModel.updateMany(
      { user: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
  }

  /**
   * Supprimer une notification (soft delete)
   */
  async remove(notificationId: string, userId: string): Promise<void> {
    this.logger.debug(`Suppression de la notification ${notificationId} pour l'utilisateur ${userId}`);
    
    await this.notificationModel.updateOne(
      { _id: notificationId, user: new Types.ObjectId(userId) },
      { $set: { isActive: false } }
    );
  }

  /**
   * Nombre de notifications non lues d'un utilisateur
   */
  async countUnread(userId: string): Promise<number> {
    this.logger.debug(`Comptage des notifications non lues pour l'utilisateur ${userId}`);
    
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
      this.logger.debug(`Envoi de notification à l'utilisateur ${userId}: ${payload.title}`);
      
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
        
        try {
          // Envoyer l'email directement
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
          
          this.logger.debug(`Email de notification envoyé à ${user.email}`);
        } catch (emailError) {
          this.logger.error(`Erreur lors de l'envoi de l'email de notification:`, emailError);
          // Ne pas échouer complètement si l'envoi d'email échoue
        }
      }
      
      // Envoyer un SMS si l'utilisateur a activé les notifications par SMS
      if (user.notificationPreferences?.sms && user.phone) {
        try {
          await this.smsService.sendSms({
            to: user.phone,
            message: `${payload.title} - ${payload.message}`
          });
          
          this.logger.debug(`SMS de notification envoyé à ${user.phone}`);
        } catch (smsError) {
          this.logger.error(`Erreur lors de l'envoi du SMS de notification:`, smsError);
          // Ne pas échouer complètement si l'envoi de SMS échoue
        }
      }
      
      return notification;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la notification:`, error);
      throw error;
    }
  }

  /**
   * Envoyer une notification à tous les administrateurs
   */
  async sendAdminNotification(payload: NotificationPayload): Promise<void> {
    try {
      this.logger.debug(`Envoi de notification à tous les administrateurs: ${payload.title}`);
      
      // Récupérer tous les administrateurs
      const admins = await this.usersService.findByRole(UserRole.ADMIN);
      
      // Envoyer une notification à chaque admin
      for (const admin of admins) {
        try {
          await this.sendUserNotification(admin.id, payload);
        } catch (error) {
          this.logger.error(`Erreur lors de l'envoi de la notification à l'admin ${admin.id}:`, error);
          // Continuer avec les autres admins même si un envoi échoue
        }
      }
      
      this.logger.debug(`Notifications envoyées à ${admins.length} administrateurs`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la notification aux administrateurs:`, error);
      throw error;
    }
  }
} 