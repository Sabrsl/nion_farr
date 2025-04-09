import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly APP_NAME = 'Nionfar';

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async generateSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
    // Générer un secret unique pour l'utilisateur
    const secret = authenticator.generateSecret();
    
    // Créer l'URI pour le QR code
    const otpauth = authenticator.keyuri(
      userId,
      this.APP_NAME,
      secret
    );
    
    // Générer le QR code
    const qrCode = await qrcode.toDataURL(otpauth);
    
    // Enregistrer le secret dans la base de données (à utiliser uniquement après vérification)
    await this.connection.collection('twoFactorSecrets').updateOne(
      { userId },
      { 
        $set: { 
          secret,
          verified: false,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    return { secret, qrCode };
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    // Récupérer le secret de l'utilisateur
    const userSecret = await this.connection.collection('twoFactorSecrets').findOne({ userId });
    
    if (!userSecret || !userSecret.secret) {
      return false;
    }
    
    // Vérifier le token
    const isValid = authenticator.verify({
      token,
      secret: userSecret.secret
    });
    
    return isValid;
  }

  async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    // Vérifier le token
    const isValid = await this.verifyToken(userId, token);
    
    if (!isValid) {
      return false;
    }
    
    // Marquer le secret comme vérifié
    await this.connection.collection('twoFactorSecrets').updateOne(
      { userId },
      { $set: { verified: true } }
    );
    
    // Mettre à jour le statut 2FA de l'utilisateur
    await this.connection.collection('users').updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { twoFactorEnabled: true } }
    );
    
    return true;
  }

  async disableTwoFactor(userId: string): Promise<void> {
    // Supprimer le secret
    await this.connection.collection('twoFactorSecrets').deleteOne({ userId });
    
    // Mettre à jour le statut 2FA de l'utilisateur
    await this.connection.collection('users').updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { twoFactorEnabled: false } }
    );
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.connection.collection('users').findOne({ _id: new Types.ObjectId(userId) });
    return user?.twoFactorEnabled || false;
  }

  async requireTwoFactor(userId: string): Promise<boolean> {
    const user = await this.connection.collection('users').findOne({ _id: new Types.ObjectId(userId) });
    
    // Vérifier si l'utilisateur a un rôle qui nécessite 2FA
    const rolesRequiring2FA = ['admin', 'manager', 'finance'];
    return user?.roles?.some(role => rolesRequiring2FA.includes(role)) || false;
  }
} 