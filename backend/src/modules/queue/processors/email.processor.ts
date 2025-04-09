import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../../email/email.service';
import { EmailJob } from '../queue.service';

@Processor('email')
export class EmailQueueProcessor {
  private readonly logger = new Logger(EmailQueueProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJob>): Promise<any> {
    try {
      this.logger.debug(`Traitement du job d'email #${job.id} - [${job.data.subject}]`);
      
      // Mettre à jour la progression du job
      await job.progress(10);
      
      const { to, subject, template, html, context } = job.data;
      
      // Envoyer l'email en fonction des données fournies
      if (template) {
        // Si un template est spécifié, utiliser le service de template
        await this.emailService.sendEmail({
          to,
          subject,
          template,
          context: context || {},
        });
      } else if (html) {
        // Sinon, envoyer l'email avec le contenu HTML fourni
        await this.emailService.sendEmail(to, subject, html);
      } else {
        throw new Error('Aucun contenu d\'email spécifié (template ou HTML)');
      }
      
      // Mise à jour finale de la progression
      await job.progress(100);
      
      this.logger.debug(`Email envoyé avec succès: ${subject} à ${to}`);
      
      return { success: true, to, subject };
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email [Job #${job.id}]:`, error);
      throw error;
    }
  }
} 