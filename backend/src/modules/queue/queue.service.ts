import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface EmailJob {
  to: string;
  subject: string;
  template?: string;
  html?: string;
  context?: Record<string, any>;
}

export interface NotificationJob {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  sendSms?: boolean;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue<EmailJob>,
    @InjectQueue('notification') private readonly notificationQueue: Queue<NotificationJob>,
  ) {}

  /**
   * Ajouter un email à la file d'attente
   * @param emailJob Les données de l'email à envoyer
   * @param priority Priorité du job (1 = la plus haute)
   * @param delay Délai en millisecondes avant l'exécution
   */
  async addEmailToQueue(
    emailJob: EmailJob,
    options: { priority?: number; delay?: number; jobId?: string } = {},
  ): Promise<string> {
    try {
      const { priority = 5, delay = 0, jobId } = options;
      
      this.logger.debug(`Ajout d'un email à la file d'attente: ${emailJob.subject} pour ${emailJob.to}`);
      
      const job = await this.emailQueue.add('send-email', emailJob, {
        priority,
        delay,
        jobId,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      
      this.logger.debug(`Email ajouté à la file d'attente avec l'ID: ${job.id}`);
      
      return job.id;
    } catch (error) {
      this.logger.error(`Erreur lors de l'ajout d'un email à la file d'attente:`, error);
      throw error;
    }
  }

  /**
   * Ajouter une notification à la file d'attente
   * @param notificationJob Les données de la notification à envoyer
   * @param priority Priorité du job (1 = la plus haute)
   * @param delay Délai en millisecondes avant l'exécution
   */
  async addNotificationToQueue(
    notificationJob: NotificationJob,
    options: { priority?: number; delay?: number; jobId?: string } = {},
  ): Promise<string> {
    try {
      const { priority = 5, delay = 0, jobId } = options;
      
      this.logger.debug(`Ajout d'une notification à la file d'attente: ${notificationJob.title} pour l'utilisateur ${notificationJob.userId}`);
      
      const job = await this.notificationQueue.add('send-notification', notificationJob, {
        priority,
        delay,
        jobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      
      this.logger.debug(`Notification ajoutée à la file d'attente avec l'ID: ${job.id}`);
      
      return job.id;
    } catch (error) {
      this.logger.error(`Erreur lors de l'ajout d'une notification à la file d'attente:`, error);
      throw error;
    }
  }

  /**
   * Vérifier l'état d'un job d'email
   */
  async getEmailJobStatus(jobId: string): Promise<any> {
    try {
      const job = await this.emailQueue.getJob(jobId);
      if (!job) {
        throw new Error(`Job d'email non trouvé avec l'ID: ${jobId}`);
      }
      
      const state = await job.getState();
      const progress = await job.progress();
      
      return {
        id: job.id,
        state,
        progress,
        data: job.data,
        attempts: job.attemptsMade,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        timestamp: job.timestamp,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'état du job d'email:`, error);
      throw error;
    }
  }

  /**
   * Vérifier l'état d'un job de notification
   */
  async getNotificationJobStatus(jobId: string): Promise<any> {
    try {
      const job = await this.notificationQueue.getJob(jobId);
      if (!job) {
        throw new Error(`Job de notification non trouvé avec l'ID: ${jobId}`);
      }
      
      const state = await job.getState();
      const progress = await job.progress();
      
      return {
        id: job.id,
        state,
        progress,
        data: job.data,
        attempts: job.attemptsMade,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        timestamp: job.timestamp,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'état du job de notification:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des files d'attente
   */
  async getQueueStats(): Promise<any> {
    try {
      const [emailCount, notificationCount] = await Promise.all([
        this.emailQueue.count(),
        this.notificationQueue.count(),
      ]);
      
      const [emailFailed, notificationFailed] = await Promise.all([
        this.emailQueue.getFailed(),
        this.notificationQueue.getFailed(),
      ]);
      
      return {
        email: {
          waiting: emailCount,
          failed: emailFailed.length,
        },
        notification: {
          waiting: notificationCount,
          failed: notificationFailed.length,
        },
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des statistiques des files d'attente:`, error);
      throw error;
    }
  }

  /**
   * Nettoyer les jobs échoués
   */
  async cleanFailedJobs(): Promise<void> {
    try {
      await Promise.all([
        this.emailQueue.clean(0, 'failed'),
        this.notificationQueue.clean(0, 'failed'),
      ]);
      
      this.logger.log('Les jobs échoués ont été nettoyés.');
    } catch (error) {
      this.logger.error(`Erreur lors du nettoyage des jobs échoués:`, error);
      throw error;
    }
  }
} 