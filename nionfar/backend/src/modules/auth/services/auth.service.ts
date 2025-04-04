import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { EmailService } from '../../email/email.service';
import { SmsService } from '../../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Implémenter la validation utilisateur avec la base de données
    const user = { id: '1', email: 'test@example.com', password: await bcrypt.hash('password', 10), role: 'user', isTwoFactorEnabled: false };
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Si l'utilisateur a activé 2FA, ne pas générer de token complet
    if (user.isTwoFactorEnabled) {
      return {
        accessToken: this.jwtService.sign(payload, { expiresIn: '5m' }),
        refreshToken: '',
        user: { id: user.id, email: user.email },
        requiresTwoFactor: true,
      };
    }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
      user,
      requiresTwoFactor: false,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Vérifier si le token est valide
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Créer un nouveau token
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // Récupérer l'utilisateur
      const user = { id: payload.sub, email: payload.email, role: payload.role };

      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        }),
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  async logout(userId: string) {
    // TODO: Implémenter la déconnexion avec la base de données
    // Idéalement, on invaliderait le refreshToken en base
    return { message: 'Déconnexion réussie.' };
  }

  async register(registerDto: any) {
    // TODO: Implémenter l'enregistrement avec la base de données
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = uuidv4();
    
    const user = {
      id: uuidv4(),
      email: registerDto.email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      isEmailVerified: false,
    };
    
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
    
    return { message: 'Inscription réussie. Veuillez vérifier votre email.' };
  }

  async verifyEmail(token: string) {
    // TODO: Implémenter la vérification d'email avec la base de données
    if (token !== 'fake-token') {
      throw new BadRequestException('Token invalide ou expiré');
    }
    
    return { message: 'Email vérifié avec succès.' };
  }

  async forgotPassword(email: string) {
    // TODO: Implémenter la réinitialisation de mot de passe avec la base de données
    const resetToken = uuidv4();
    
    await this.emailService.sendPasswordResetEmail(email, resetToken);
    
    return { message: 'Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation.' };
  }

  async resetPassword(token: string, newPassword: string) {
    // TODO: Implémenter la réinitialisation de mot de passe avec la base de données
    if (token !== 'fake-token') {
      throw new BadRequestException('Token invalide ou expiré');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async generateTwoFactorQrCode(userId: string) {
    // TODO: Implémenter la génération de QR code avec la base de données
    const user = { id: userId, email: 'test@example.com' };
    
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.email,
      this.configService.get<string>('TWO_FACTOR_APP_NAME'),
      secret,
    );
    
    const qrCodeDataUrl = await toDataURL(otpAuthUrl);
    
    return {
      secret,
      qrCodeDataUrl,
    };
  }

  async enableTwoFactor(userId: string, twoFactorCode: string) {
    // TODO: Implémenter l'activation de l'authentification à deux facteurs avec la base de données
    const user = { id: userId, twoFactorSecret: 'FAKE_SECRET' };
    
    const isCodeValid = authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorSecret,
    });
    
    if (!isCodeValid) {
      throw new UnauthorizedException('Code invalide');
    }
    
    return { message: 'Authentification à deux facteurs activée avec succès.' };
  }

  async disableTwoFactor(userId: string) {
    // TODO: Implémenter la désactivation de l'authentification à deux facteurs avec la base de données
    return { message: 'Authentification à deux facteurs désactivée avec succès.' };
  }

  async resendVerificationEmail(userId: string) {
    // TODO: Implémenter le renvoi d'email de vérification avec la base de données
    const user = { id: userId, email: 'test@example.com' };
    const verificationToken = uuidv4();
    
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
    
    return { message: 'Email de vérification renvoyé avec succès.' };
  }

  async verifyTwoFactor(userId: string, twoFactorCode: string) {
    // TODO: Implémenter la vérification de l'authentification à deux facteurs avec la base de données
    const user = { 
      id: userId, 
      email: 'test@example.com',
      role: 'user',
      twoFactorSecret: 'FAKE_SECRET' 
    };
    
    const isCodeValid = authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorSecret,
    });
    
    if (!isCodeValid) {
      throw new UnauthorizedException('Code invalide');
    }
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
      user,
    };
  }
} 