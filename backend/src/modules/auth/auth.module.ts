import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityModule } from '../../security/security.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TwoFactorService } from './services/two-factor.service';
import { User } from '../users/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TokenService } from '../../auth/token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    SecurityModule,
    EmailModule,
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    TwoFactorService,
    JwtStrategy, 
    JwtRefreshStrategy,
    LocalStrategy,
    TokenService
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {} 