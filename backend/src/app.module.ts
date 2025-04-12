import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController, RootController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import { getMongooseMemoryOptions, getTypeOrmMemoryOptions } from './config/mongodb-memory-options';
import { getMemoryConfig } from './config/environment';
import { GlobalExceptionFilter } from './common/interceptors/http-exception.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { MemoryTrackerMiddleware } from './middleware/memory-tracker.middleware';

// Modules
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AppService } from './app.service';
import { SecurityModule } from './security/security.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { QueueModule } from './modules/queue/queue.module';
import { IpModule } from './ip/ip.module';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    
    // Logger
    LoggerModule,
    
    // Database - TypeORM configuré avec MongoDB
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const memoryConfig = getMemoryConfig();
        
        return {
          type: 'mongodb',
          url: configService.get<string>('MONGODB_URI'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          ...(memoryConfig.isConstrained ? getTypeOrmMemoryOptions() : {
            synchronize: false,
            retryAttempts: 3,
            retryDelay: 3000,
          }),
        };
      },
    }),
    
    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const memoryConfig = getMemoryConfig();
        
        return [{
          ttl: memoryConfig.isConstrained ? 60 * 1000 * 30 : 60 * 1000 * 10, // 30 min in constrained vs 10 min
          limit: 50,
        }];
      },
    }),
    
    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    
    // Connexion à MongoDB via Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const memoryConfig = getMemoryConfig();
        
        return {
          uri: configService.get<string>('MONGODB_URI'),
          ...(memoryConfig.isConstrained ? getMongooseMemoryOptions() : {
            retryAttempts: 3,
            retryDelay: 3000,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
          }),
        };
      },
    }),
    
    // Planification des tâches - disabled in memory constrained mode
    ...(getMemoryConfig().disableScheduledTasks ? [] : [ScheduleModule.forRoot()]),
    
    // Application modules
    AuthModule,
    UsersModule,
    ServicesModule,
    OrdersModule,
    PaymentsModule,
    MessagesModule,
    ReviewsModule,
    AdminModule,
    NotificationsModule,
    EmailModule,
    SmsModule,
    DisputesModule,
    HealthModule,
    SecurityModule,
    QueueModule,
    IpModule,
    PerformanceModule,
  ],
  controllers: [AppController, RootController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {
    // Chargement conditionnel du BackupService si nous ne sommes pas en production
    if (configService.get('NODE_ENV') !== 'production' && !getMemoryConfig().disableBackups) {
      try {
        // Tentative d'import dynamique du BackupService avec gestion d'erreur améliorée
        console.log('🔄 Tentative de chargement du BackupService...');
        
        // Vérifier d'abord si le fichier existe pour éviter les erreurs d'importation
        const fs = require('fs');
        const path = require('path');
        const backupJsPath = path.join(__dirname, 'scripts', 'backup.js');
        
        if (fs.existsSync(backupJsPath)) {
          import('./scripts/backup').then(module => {
            console.log('✅ BackupService chargé avec succès');
          }).catch(err => {
            console.warn('⚠️ BackupService non disponible (import dynamique):', err.message);
          });
        } else {
          console.log(`⚠️ Le fichier ${backupJsPath} n'existe pas, BackupService désactivé`);
        }
      } catch (error) {
        console.warn('⚠️ Import dynamique du BackupService échoué:', error.message);
      }
    } else {
      console.log('ℹ️ BackupService désactivé en production ou en mode économie de mémoire');
    }
  }

  configure(consumer: MiddlewareConsumer) {
    // Apply memory tracker middleware to all routes if in memory optimized mode
    if (process.env.MEMORY_OPTIMIZED === 'true') {
      consumer.apply(MemoryTrackerMiddleware).forRoutes('*');
    }
  }
} 