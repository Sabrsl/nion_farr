import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import { BackupService } from './scripts/backup';
import { getMongooseMemoryOptions, getTypeOrmMemoryOptions } from './config/mongodb-memory-options';
import { getMemoryConfig } from './config/environment';
import { SyncControlService } from './scripts/sync-control';

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

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    
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
            useNewUrlParser: true,
            useUnifiedTopology: true,
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
            useNewUrlParser: true,
            useUnifiedTopology: true,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SyncControlService,
    // Disable BackupService in memory-constrained environments as it's resource intensive
    ...(getMemoryConfig().disableBackups ? [] : [BackupService]),
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
  ],
})
export class AppModule {} 