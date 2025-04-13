import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    this.logger.debug(`🔐 Tentative d'authentification pour l'email: ${email}`);
    
    try {
      const user = await this.authService.validateUser(email, password);
      
      if (!user) {
        this.logger.warn(`❌ Échec d'authentification pour l'email: ${email} - Utilisateur non trouvé ou mot de passe incorrect`);
        throw new UnauthorizedException('Identifiants invalides');
      }
      
      this.logger.debug(`✅ Authentification réussie pour l'email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'authentification pour l'email: ${email} - ${error.message}`);
      throw new UnauthorizedException('Identifiants invalides');
    }
  }
} 