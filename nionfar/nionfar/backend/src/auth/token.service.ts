import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes en secondes
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 jours en secondes

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    try {
      // Créer l'index TTL pour supprimer automatiquement les tokens expirés
      this.connection.collection('refreshTokens').createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );
    } catch (error) {
      this.logger.error(`Failed to create TTL index: ${error.message}`);
    }
  }

  async generateTokens(userId: string, roles: string[]): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Générer un identifiant unique pour le token de rafraîchissement
      const tokenId = uuidv4();
      
      // Créer le token d'accès
      const accessToken = this.jwtService.sign(
        { 
          sub: userId,
          roles,
          type: 'access'
        },
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      );
      
      // Créer le token de rafraîchissement
      const refreshToken = this.jwtService.sign(
        { 
          sub: userId,
          tokenId,
          type: 'refresh'
        },
        { expiresIn: this.REFRESH_TOKEN_EXPIRY }
      );
      
      // Enregistrer le token de rafraîchissement dans la base de données
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + this.REFRESH_TOKEN_EXPIRY);
      
      await this.connection.collection('refreshTokens').insertOne({
        tokenId,
        userId,
        expiresAt,
        createdAt: new Date(),
        revoked: false
      });
      
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`Failed to generate tokens: ${error.message}`);
      throw new UnauthorizedException('Failed to generate authentication tokens');
    }
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string; tokenId: string } | null> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'refresh') {
        this.logger.warn(`Invalid token type: ${payload.type}`);
        return null;
      }
      
      // Vérifier si le token existe et n'est pas révoqué
      const storedToken = await this.connection.collection('refreshTokens').findOne({
        tokenId: payload.tokenId,
        revoked: false
      });
      
      if (!storedToken) {
        this.logger.warn(`Token not found or revoked: ${payload.tokenId}`);
        return null;
      }
      
      return {
        userId: payload.sub,
        tokenId: payload.tokenId
      };
    } catch (error) {
      this.logger.error(`Error verifying refresh token: ${error.message}`);
      return null;
    }
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    try {
      await this.connection.collection('refreshTokens').updateOne(
        { tokenId },
        { $set: { revoked: true } }
      );
    } catch (error) {
      this.logger.error(`Failed to revoke refresh token: ${error.message}`);
      throw new UnauthorizedException('Failed to revoke refresh token');
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await this.connection.collection('refreshTokens').updateMany(
        { userId, revoked: false },
        { $set: { revoked: true } }
      );
    } catch (error) {
      this.logger.error(`Failed to revoke all user tokens: ${error.message}`);
      throw new UnauthorizedException('Failed to revoke all user tokens');
    }
  }
} 