import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailQueueProcessor } from './processors/email.processor';
import { NotificationQueueProcessor } from './processors/notification.processor';
import { QueueService } from './queue.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
          // Utiliser une connexion de secours en mémoire en mode développement
          // si Redis n'est pas disponible
          enableOfflineQueue: configService.get('NODE_ENV') !== 'production',
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'notification',
      }
    ),
    EmailModule,
    NotificationsModule,
  ],
  providers: [QueueService, EmailQueueProcessor, NotificationQueueProcessor],
  exports: [QueueService],
})
export class QueueModule {} 