import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import roleService from '../../services/roleService';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('client' | 'freelance' | 'provider' | 'admin')[];
  fallbackPath?: string;
}

/**
 * Composant qui protège les routes en fonction du rôle de l'utilisateur
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  fallbackPath
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Ne rien faire si en cours de chargement
    if (isLoading) return;

    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Vérifier si l'utilisateur a le bon rôle
    const hasPermission = allowedRoles.includes(user.role);
    
    if (!hasPermission) {
      // Si un chemin de repli est spécifié, rediriger vers celui-ci
      // Sinon, rediriger vers le tableau de bord par défaut pour ce rôle
      const redirectPath = fallbackPath || roleService.getDefaultDashboard(user);
      router.push(redirectPath);
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, fallbackPath, router]);

  // Pendant le chargement ou si l'utilisateur n'est pas authentifié, on peut afficher un loader
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a le bon rôle
  const hasPermission = allowedRoles.includes(user.role);
  
  // Si l'utilisateur n'a pas la permission, ne rien afficher pendant la redirection
  if (!hasPermission) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Redirection vers votre tableau de bord...</p>
      </div>
    );
  }

  // Si l'utilisateur a la permission, afficher le contenu
  return <>{children}</>;
};

export default RoleGuard; 