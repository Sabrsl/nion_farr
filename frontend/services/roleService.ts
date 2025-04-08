import { User } from '../types';

type UserRole = 'client' | 'provider' | 'admin';

/**
 * Service de gestion des rôles pour NionFar
 */
const roleService = {
  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole: (user: User | null, role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  },

  /**
   * Vérifie si l'utilisateur est un client
   */
  isClient: (user: User | null): boolean => {
    return roleService.hasRole(user, 'client');
  },

  /**
   * Vérifie si l'utilisateur est un prestataire/freelancer
   */
  isProvider: (user: User | null): boolean => {
    return roleService.hasRole(user, 'provider');
  },

  /**
   * Vérifie si l'utilisateur est un administrateur
   */
  isAdmin: (user: User | null): boolean => {
    return roleService.hasRole(user, 'admin');
  },

  /**
   * Obtient le tableau de bord par défaut en fonction du rôle de l'utilisateur
   */
  getDefaultDashboard: (user: User | null): string => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'client':
        return '/dashboard/client';
      case 'provider':
        return '/dashboard/freelance';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  },

  /**
   * Obtient la page de détails de commande appropriée en fonction du rôle
   */
  getOrderDetailsPath: (user: User | null, orderId: string): string => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'client':
        return `/dashboard/client/orders/${orderId}`;
      case 'provider':
        return `/dashboard/freelance/orders/${orderId}`;
      case 'admin':
        return `/dashboard/admin/orders/${orderId}`;
      default:
        return `/dashboard/orders/${orderId}`;
    }
  },

  /**
   * Vérifie si l'utilisateur a accès à une page spécifique
   */
  canAccessPage: (user: User | null, path: string): boolean => {
    if (!user) return false;
    
    // Pages du tableau de bord client
    if (path.startsWith('/dashboard/client') && !roleService.isClient(user)) {
      return false;
    }
    
    // Pages du tableau de bord freelance
    if (path.startsWith('/dashboard/freelance') && !roleService.isProvider(user)) {
      return false;
    }
    
    // Pages d'administration
    if (path.startsWith('/dashboard/admin') && !roleService.isAdmin(user)) {
      return false;
    }
    
    return true;
  }
};

export default roleService; 