import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AuditService, AuditAction } from './audit.service';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { UserRole } from '../../users/enums/user-role.enum';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly APP_NAME = 'NionFar';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async generateSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, this.APP_NAME, secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    // Sauvegarder le secret temporairement
    user.twoFactorSecret = secret;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      action: AuditAction.TWO_FACTOR_ENABLED,
      details: { 
        message: 'Génération du secret 2FA',
        type: 'secret_generation'
      },
      ipAddress: 'SYSTEM',
      userAgent: 'SYSTEM',
      timestamp: new Date()
    });

    return { secret, qrCode };
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new NotFoundException('Utilisateur non trouvé ou 2FA non configuré');
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });

    await this.auditService.log({
      userId,
      action: isValid ? AuditAction.TWO_FACTOR_ENABLED : AuditAction.LOGIN_FAILED,
      details: { 
        message: isValid ? 'Vérification 2FA réussie' : 'Échec de la vérification 2FA',
        success: isValid,
        type: 'token_verification'
      },
      ipAddress: 'SYSTEM',
      userAgent: 'SYSTEM',
      timestamp: new Date()
    });

    return isValid;
  }

  async enable(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new NotFoundException('Utilisateur non trouvé ou 2FA non configuré');
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    user.isTwoFactorEnabled = true;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      action: AuditAction.TWO_FACTOR_ENABLED,
      details: { 
        message: '2FA activé avec succès',
        success: true,
        type: 'enable_2fa'
      },
      ipAddress: 'SYSTEM',
      userAgent: 'SYSTEM',
      timestamp: new Date()
    });
  }

  async disable(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isTwoFactorEnabled) {
      throw new NotFoundException('Utilisateur non trouvé ou 2FA non activé');
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      action: AuditAction.TWO_FACTOR_DISABLED,
      details: { 
        message: '2FA désactivé',
        success: true,
        type: 'disable_2fa'
      },
      ipAddress: 'SYSTEM',
      userAgent: 'SYSTEM',
      timestamp: new Date()
    });
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      return user?.isTwoFactorEnabled || false;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification du statut 2FA: ${error.message}`);
      throw error;
    }
  }

  async requireTwoFactor(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      // Vérifier si l'utilisateur a un rôle qui nécessite 2FA
      const rolesRequiring2FA = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
      return user?.role && rolesRequiring2FA.includes(user.role) || false;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification de l'obligation 2FA: ${error.message}`);
      throw error;
    }
  }

  // Alias pour la compatibilité avec le code existant
  async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    await this.enable(userId, token);
    return true;
  }

  // Alias pour la compatibilité avec le code existant
  async disableTwoFactor(userId: string): Promise<void> {
    // Pour la désactivation, nous n'avons pas besoin de vérifier le token
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isTwoFactorEnabled) {
      throw new NotFoundException('Utilisateur non trouvé ou 2FA non activé');
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      action: AuditAction.TWO_FACTOR_DISABLED,
      details: { 
        message: '2FA désactivé',
        success: true,
        type: 'disable_2fa'
      },
      ipAddress: 'SYSTEM',
      userAgent: 'SYSTEM',
      timestamp: new Date()
    });
  }
} 