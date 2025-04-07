import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupérer les rôles nécessaires à partir du décorateur
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle n'est requis, autoriser l'accès
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Si aucun utilisateur n'est trouvé, refuser l'accès
    if (!user) {
      throw new ForbiddenException('Vous devez être connecté pour accéder à cette ressource');
    }

    // Vérifier si l'utilisateur a le rôle ADMIN (qui a tous les droits)
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Vérifier si l'utilisateur a au moins l'un des rôles requis
    const hasRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRole) {
      // Journaliser la tentative d'accès non autorisée
      console.log(`[SECURITY WARNING] Tentative d'accès non autorisée: ${user.email} (${user.role}) a tenté d'accéder à une ressource nécessitant les rôles ${requiredRoles.join(', ')}`);
      throw new ForbiddenException(`Accès refusé. Vous devez avoir l'un des rôles suivants: ${requiredRoles.join(', ')}`);
    }
    
    return hasRole;
  }
} 