import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Vérifier si la route est publique (décorateur @Public())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Appeler la méthode canActivate du parent pour vérifier le JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Si une erreur est survenue ou si l'utilisateur n'est pas trouvé
    if (err || !user) {
      throw err || new UnauthorizedException('Accès non autorisé');
    }
    return user;
  }
} 