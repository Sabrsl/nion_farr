import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class LoginAttemptService {
  private readonly logger = new Logger(LoginAttemptService.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes
  private readonly ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 heure en millisecondes

  constructor(@InjectConnection() private readonly connection: Connection) {
    // Créer l'index TTL pour supprimer automatiquement les tentatives après la fenêtre
    this.connection.collection('loginAttempts').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: this.ATTEMPT_WINDOW / 1000 }
    );
  }

  async recordFailedAttempt(identifier: string): Promise<{ isLocked: boolean; remainingAttempts: number; lockoutEndsAt?: Date }> {
    const now = new Date();
    const lockoutEndsAt = new Date(now.getTime() + this.LOCKOUT_DURATION);

    // Enregistrer la tentative échouée
    await this.connection.collection('loginAttempts').insertOne({
      identifier,
      createdAt: now,
    });

    // Compter les tentatives dans la fenêtre
    const attempts = await this.connection.collection('loginAttempts').countDocuments({
      identifier,
      createdAt: { $gte: new Date(now.getTime() - this.ATTEMPT_WINDOW) }
    });

    const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - attempts);
    const isLocked = attempts >= this.MAX_ATTEMPTS;

    return {
      isLocked,
      remainingAttempts,
      lockoutEndsAt: isLocked ? lockoutEndsAt : undefined
    };
  }

  async isLocked(identifier: string): Promise<{ isLocked: boolean; lockoutEndsAt?: Date }> {
    const now = new Date();
    
    // Compter les tentatives dans la fenêtre
    const attempts = await this.connection.collection('loginAttempts').countDocuments({
      identifier,
      createdAt: { $gte: new Date(now.getTime() - this.ATTEMPT_WINDOW) }
    });

    const isLocked = attempts >= this.MAX_ATTEMPTS;
    
    if (isLocked) {
      // Calculer quand le verrouillage se termine
      const lockoutEndsAt = new Date(now.getTime() + this.LOCKOUT_DURATION);
      return { isLocked, lockoutEndsAt };
    }

    return { isLocked: false };
  }

  async resetAttempts(identifier: string): Promise<void> {
    await this.connection.collection('loginAttempts').deleteMany({ identifier });
  }
} 