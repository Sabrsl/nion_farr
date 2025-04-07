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
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryAttempts: 5,
        retryDelay: 3000,
      }),
    }),
    
    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ([
        {
          ttl: configService.get('THROTTLE_TTL', 60) * 1000,
          limit: configService.get('THROTTLE_LIMIT', 10),
        },
      ]),
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
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryAttempts: 5,
        retryDelay: 3000,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      }),
    }),
    
    // Planification des tâches
    ScheduleModule.forRoot(),
    
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BackupService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {} 