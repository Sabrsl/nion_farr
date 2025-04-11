import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Vérifier d'abord l'authentification JWT de base
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      throw new UnauthorizedException('Authentication required');
    }
    
    // Obtenir l'utilisateur à partir de la requête
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Vérifier si l'utilisateur a le rôle admin
    if (!user || !user.roles || !user.roles.includes('admin')) {
      throw new ForbiddenException('Accès administrateur requis');
    }
    
    return true;
  }
} 