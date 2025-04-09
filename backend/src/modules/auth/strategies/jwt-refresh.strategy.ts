import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private readonly configService: ConfigService,
  ) {
    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
    });
    
    if (!refreshSecret) {
      this.logger.error('JWT_REFRESH_SECRET n\'est pas défini dans les variables d\'environnement!');
    }
    
    this.logger.log('Stratégie JWT Refresh initialisée');
  }

  async validate(payload: JwtPayload) {
    return { 
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
} 