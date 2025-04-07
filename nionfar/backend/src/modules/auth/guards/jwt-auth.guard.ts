import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Vérifier si la route est marquée comme publique avec @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la route est publique, autoriser l'accès sans vérification
    if (isPublic) {
      return true;
    }

    // Sinon, exécuter la validation JWT standard
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    // Gestion améliorée des erreurs de token
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expiré. Veuillez vous reconnecter.');
      } else if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Token invalide. Veuillez vous reconnecter.');
      } else {
        throw new UnauthorizedException('Non autorisé. Veuillez vous connecter.');
      }
    }
    
    return user;
  }
} 