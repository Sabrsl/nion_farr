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
    this.logger.log(`Validation de l'utilisateur: ${email}`);
    
    try {
      // Rechercher l'utilisateur par email
      const user = await this.usersRepository.findOne({ 
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          isFreelancer: true,
          firstName: true,
          lastName: true,
          username: true,
          isActive: true,
          status: true
        }
      });
      
      // Vérifier si l'utilisateur existe
      if (!user) {
        this.logger.warn(`Échec de la validation: l'utilisateur avec l'email ${email} n'existe pas`);
        return null;
      }
      
      // Si l'utilisateur existe, vérifier si son compte est actif
      if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING_VERIFICATION) {
        this.logger.warn(`Échec de la validation: l'utilisateur ${email} est désactivé (status: ${user.status})`);
        return null;
      }
      
      // Log pour voir le format du mot de passe hashé récupéré de la base
      this.logger.debug(`📋 Mot de passe hashé récupéré de la base: ${user.password?.substring(0, 20)}...`);
      
      // Vérifier le mot de passe
      this.logger.debug(`🔐 Vérification du mot de passe avec bcrypt.compare pour l'utilisateur: ${email}`);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn(`❌ Échec de la validation: mot de passe incorrect pour l'utilisateur ${email}`);
        return null;
      }
      
      // Utilisateur trouvé et mot de passe valide
      this.logger.log(`✅ Validation réussie pour l'utilisateur: ${email} - bcrypt.compare a retourné true`);
      
      // Supprimer le mot de passe du résultat
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de la validation de l'utilisateur: ${error.message}`);
      return null;
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
    // TODO: Implémenter la déconnexion avec la base de données
    // Idéalement, on invaliderait le refreshToken en base
    return { message: 'Déconnexion réussie.' };
  }

  async register(registerDto: any) {
    try {
      this.logger.log(`Inscription d'un nouvel utilisateur: ${registerDto.email}`);
      this.logger.debug(`Données d'inscription reçues: ${JSON.stringify({
        ...registerDto,
        password: registerDto.password ? '[MASKED]' : undefined
      })}`);
      
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
      
      // Initialiser toutes les propriétés de l'utilisateur selon la définition de l'entité User
      const userData = {
        email: registerDto.email,
        username: registerDto.username || registerDto.email.split('@')[0],
        firstName: registerDto.firstName || '',
        lastName: registerDto.lastName || '',
        password: hashedPassword,
        role: registerDto.role?.toLowerCase() || 'client',
        status: UserStatus.PENDING_VERIFICATION,
        isFreelancer: registerDto.isFreelancer || registerDto.role?.toLowerCase() === 'freelancer',
        
        // Propriétés de vérification
        emailVerificationToken: verificationToken,
        isEmailVerified: false,
        isPhoneVerified: false,
        isIdentityVerified: false,
        
        // Propriétés de contact et profil
        phoneNumber: registerDto.phoneNumber || null,
        phone: registerDto.phoneNumber || null,
        address: null,
        city: null,
        country: null,
        bio: '',
        bioText: '',
        skills: [],
        avatar: null,
        
        // Propriétés pour l'authentification
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        refreshToken: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        
        // Propriétés de statistiques et de profil
        isActive: true,
        lastLogin: null,
        memberSince: new Date(),
        completedOrders: 0,
        rating: 0,
        totalReviews: 0,
        balance: 0,
        
        // Propriétés par défaut des objets JSON
        providerProfile: null,
        paymentInfo: null,
        notificationPreferences: {
          email: true,
          sms: false,
          browserPush: false,
          orderUpdates: true,
          marketingEmails: false,
          newMessages: true
        },
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.logger.debug(`Création d'utilisateur avec les données: ${JSON.stringify({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isFreelancer: userData.isFreelancer,
        status: userData.status
      })}`);
      
      try {
        // Créer l'entité utilisateur en utilisant repository.create pour initialiser correctement l'entité
        const newUser = this.usersRepository.create(userData);
        
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
      } catch (dbError) {
        this.logger.error(`Erreur lors de la création de l'utilisateur: ${dbError.message}`);
        if (dbError.code === '23505') { // Code pour violation d'unicité dans PostgreSQL
          throw new ConflictException('Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà');
        }
        if (dbError.message.includes('createValueMap')) {
          this.logger.error('Erreur TypeORM createValueMap - Détails:', dbError);
          throw new BadRequestException('Erreur lors de la création de l\'utilisateur: problème avec les données fournies');
        }
        throw new BadRequestException(`Erreur lors de la création de l'utilisateur: ${dbError.message}`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription: ${error.message}`);
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || "Une erreur est survenue lors de l'inscription");
    }
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