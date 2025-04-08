import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/authService';

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Supprimer les informations d'authentification du localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('failed_attempts');
          localStorage.removeItem('blocked_until');
        }
        
        // Nettoyer l'état du service d'authentification
        await authService.logout(router);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } finally {
        // Rediriger directement vers la page d'accueil du site
        window.location.href = '/';
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-xl font-semibold mb-4">Déconnexion en cours...</h1>
        <p className="text-gray-600">Vous êtes en train d'être déconnecté, veuillez patienter.</p>
        <div className="mt-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage; 