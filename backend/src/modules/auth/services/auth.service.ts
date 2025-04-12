import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { EmailService } from '../../email/email.service';
import { SmsService } from '../../sms/sms.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenService } from '../../../auth/token.service';
import { UserStatus } from '../../users/entities/user-status.enum';
import { MoreThan } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private emailService: EmailService,
    private smsService: SmsService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'role', 'isTwoFactorEnabled', 'status']
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Compte non activé ou suspendu');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Erreur de validation utilisateur: ${error.message}`);
      throw error;
    }
  }

  async login(user: any, rememberMe?: boolean) {
    const payload = { sub: user.id, username: user.email };
    
    // Générer les tokens
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET') || 'refreshSecret',
      expiresIn: rememberMe ? '7d' : '24h',
    });
    
    // Stocker le refresh token en base de données
    await this.storeRefreshToken(user.id, refreshToken);
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isFreelancer: user.isFreelancer,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Vérifier que le refresh token existe dans la base de données
    const isRefreshTokenValid = await this.validateRefreshToken(userId, refreshToken);
    
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    // Récupérer l'utilisateur
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'role', 'firstName', 'lastName', 'isFreelancer', 'isTwoFactorEnabled'],
    });
    
    // Générer un nouveau token d'accès
    const payload = { sub: user.id, username: user.email };
    const accessToken = this.jwtService.sign(payload);
    
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isFreelancer: user.isFreelancer,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  async logout(userId: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId }
      });

      if (user) {
        user.refreshToken = null;
        await this.usersRepository.save(user);
        
        this.logger.log(`Utilisateur déconnecté: ${userId}`);
      }

      return { message: 'Déconnexion réussie' };
    } catch (error) {
      this.logger.error(`Erreur lors de la déconnexion: ${error.message}`);
      throw error;
    }
  }

  async register(registerDto: any) {
    try {
      this.logger.log(`Inscription d'un nouvel utilisateur: ${registerDto.email}`);
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: registerDto.email } 
      });
      
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const verificationToken = uuidv4();
      
      // Créer une nouvelle entité utilisateur avec les données fournies
      const newUser = new User({
        email: registerDto.email,
        username: registerDto.username,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        isEmailVerified: false,
        role: registerDto.role?.toLowerCase() || 'client',
        isFreelancer: registerDto.isFreelancer || registerDto.role?.toLowerCase() === 'freelancer'
      });
      
      // Sauvegarder l'utilisateur dans la base de données
      const savedUser = await this.usersRepository.save(newUser);
      this.logger.log(`Utilisateur créé avec succès: ${savedUser.id}`);
      
      // Essayer d'envoyer un email de vérification
      try {
        await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);
        this.logger.log(`Email de vérification envoyé à: ${savedUser.email}`);
      } catch (emailError) {
        this.logger.error(`Erreur lors de l'envoi de l'email: ${emailError.message}`);
        // On continue malgré l'erreur d'email
      }
      
      // Générer un token pour l'utilisateur
      const payload = { 
        sub: savedUser.id, 
        email: savedUser.email,
        role: savedUser.role
      };
      
      const token = this.jwtService.sign(payload);
      
      // Préparer la réponse sans données sensibles
      const { password, emailVerificationToken, ...userResponse } = savedUser;
      
      return { 
        message: 'Inscription réussie',
        user: userResponse,
        token
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription: ${error.message}`);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error.message || "Une erreur est survenue lors de l'inscription");
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { emailVerificationToken: token }
      });

      if (!user) {
        throw new BadRequestException('Token de vérification invalide ou expiré');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.status = UserStatus.ACTIVE;
      
      await this.usersRepository.save(user);
      
      this.logger.log(`Email vérifié avec succès pour l'utilisateur: ${user.id}`);
      
      return { 
        message: 'Email vérifié avec succès',
        user: {
          id: user.id,
          email: user.email,
          status: user.status
        }
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification de l'email: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { email }
      });

      if (!user) {
        // Pour des raisons de sécurité, on renvoie le même message même si l'email n'existe pas
        return { 
          message: 'Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation.' 
        };
      }

      const resetToken = uuidv4();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token valide pendant 1 heure

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      
      await this.usersRepository.save(user);

      await this.emailService.sendPasswordResetEmail(email, resetToken);
      
      this.logger.log(`Email de réinitialisation envoyé à: ${email}`);
      
      return { 
        message: 'Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation.' 
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la demande de réinitialisation: ${error.message}`);
      throw new BadRequestException('Une erreur est survenue lors de la demande de réinitialisation');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { 
          resetPasswordToken: token,
          resetPasswordExpires: MoreThan(new Date())
        }
      });

      if (!user) {
        throw new BadRequestException('Token invalide ou expiré');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      
      await this.usersRepository.save(user);
      
      this.logger.log(`Mot de passe réinitialisé pour l'utilisateur: ${user.id}`);
      
      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`);
      throw error;
    }
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

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      // Ici, vous pouvez stocker le token dans la base de données
      // Par exemple, mettre à jour l'utilisateur avec son refresh token actuel
      await this.usersRepository.update(userId, {
        refreshToken: refreshToken,
      });
    } catch (error) {
      this.logger.error(`Failed to store refresh token: ${error.message}`);
      throw new UnauthorizedException('Failed to store refresh token');
    }
  }

  private async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    try {
      // Récupérer l'utilisateur avec son token de rafraîchissement
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        select: ['id', 'refreshToken'],
      });

      if (!user || !user.refreshToken) {
        return false;
      }

      // Vérifier que le token correspond
      return user.refreshToken === token;
    } catch (error) {
      this.logger.error(`Failed to validate refresh token: ${error.message}`);
      return false;
    }
  }
} 