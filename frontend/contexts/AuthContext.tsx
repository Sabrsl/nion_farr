import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { API_BASE_URL } from '../config';
import { NextRouter } from 'next/router';

// Clé constante pour le localStorage
const USER_STORAGE_KEY = 'nionfarUser';

// Ajouter un flag pour déterminer si nous utilisons des URLs absolues ou relatives
const USE_ABSOLUTE_URLS = process.env.NEXT_PUBLIC_FORCE_ABSOLUTE_URLS === 'true' || true;

// Fonction pour construire les URLs d'API
const buildApiUrl = (path: string) => {
  if (USE_ABSOLUTE_URLS) {
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path; // URL relative
};

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, autoRedirect?: boolean, customUrl?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  refreshAuthState: () => void;
  isFreelancer: () => boolean;
  getDashboardPath: () => string;
  redirectToDashboard: (router?: NextRouter, customUrl?: string) => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  updateUser: async () => false,
  refreshAuthState: () => {},
  isFreelancer: () => false,
  getDashboardPath: () => '/login',
  redirectToDashboard: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

/**
 * Hook pour accéder au contexte d'authentification
 */
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Fournisseur du contexte d'authentification
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Rafraîchit l'état d'authentification en récupérant les données utilisateur du localStorage
   */
  const refreshAuthState = useCallback(() => {
    // Seulement exécuter côté client
    if (!isMounted) return;
    
    try {
      // Assurer que ceci fonctionne uniquement côté client
      if (typeof window === 'undefined') return;
      
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (e) {
          console.error('[AuthContext] Erreur lors du parsing des données utilisateur:', e);
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Erreur lors du rafraîchissement de l\'état d\'authentification:', error);
    } finally {
      setLoading(false);
    }
  }, [isMounted]);

  // Marquer le composant comme monté (côté client uniquement)
  useEffect(() => {
    setIsMounted(true);
    // Initialiser immédiatement le state client après le premier rendu
    setLoading(false);
    return () => setIsMounted(false);
  }, []);

  // Initialisation du contexte au montage et gestion des changements de localStorage
  useEffect(() => {
    // Ne rien faire pendant le rendu serveur
    if (!isMounted || typeof window === 'undefined') return;
    
    // Vérifier l'état initial
    refreshAuthState();
    
    // Créer une fonction claire pour la gestion des événements de stockage
    const handleStorageChange = (e: StorageEvent | null) => {
      // Si c'est un événement déclenché manuellement ou si c'est la clé utilisateur qui a changé
      if (!e || e.key === USER_STORAGE_KEY || e.key === 'auth_updated') {
        // Appliquer un délai pour éviter les problèmes de timing
        setTimeout(() => {
          refreshAuthState();
        }, 50);
      }
    };
    
    // Écouter les changements de localStorage (pour les autres onglets)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshAuthState, isMounted]);

  /**
   * Authentifie un utilisateur avec son email et mot de passe
   */
  const login = async (email: string, password: string, autoRedirect?: boolean, customUrl?: string) => {
    try {
      setLoading(true);
      
      // En production, effectuer une requête API réelle
      try {
        const response = await fetch(buildApiUrl('/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Erreur de connexion:', responseData.error || 'Erreur inconnue');
          return false;
        }
        
        if (!responseData.success || !responseData.user) {
          console.error('Réponse de login invalide:', responseData);
          return false;
        }
        
        // Assurer la structure correcte des données utilisateur
        const userData = {
          id: responseData.user.id,
          email: responseData.user.email,
          name: responseData.user.name || email.split('@')[0],
          role: responseData.user.role || 'client',
          ...(responseData.user)
        };
        
        setUser(userData);
        
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } catch (storageError) {
          console.error('Erreur lors du stockage des données utilisateur:', storageError);
          // Continuer quand même, mais l'état sera perdu à la recharge de la page
        }
        
        return true;
      } catch (error) {
        console.error('Erreur de connexion:', error);
        return false;
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnecte l'utilisateur courant
   */
  const logout = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API pour déconnecter l'utilisateur côté serveur
      try {
        await fetch(buildApiUrl('/auth/logout'), {
          method: 'POST'
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion côté serveur:', error);
        // Continuer quand même avec la déconnexion locale
      }
      
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (storageError) {
        console.error('Erreur lors de la suppression des données utilisateur:', storageError);
      }
      
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crée un nouvel utilisateur
   */
  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      setLoading(true);
      
      // Appeler l'API pour inscrire l'utilisateur
      try {
        const response = await fetch(buildApiUrl('/auth/register'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Erreur lors de l\'inscription:', responseData.error || 'Erreur inconnue');
          return false;
        }
        
        if (!responseData.success) {
          console.error('Réponse d\'inscription invalide:', responseData);
          return false;
        }
        
        // Si l'inscription est réussie mais n'authentifie pas automatiquement
        if (responseData.success && !responseData.user) {
          return true;
        }
        
        // Si l'inscription authentifie automatiquement
        if (responseData.user) {
          // Assurer la structure correcte des données utilisateur
          const newUser = {
            id: responseData.user.id,
            email: responseData.user.email,
            name: responseData.user.name || userData.email?.split('@')[0] || 'Utilisateur',
            role: responseData.user.role || userData.role || 'client',
            ...(responseData.user)
          };
          
          setUser(newUser);
          
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
          } catch (storageError) {
            console.error('Erreur lors du stockage des données utilisateur:', storageError);
            // Continuer quand même, mais l'état sera perdu à la recharge de la page
          }
        }
        
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Met à jour les informations de l'utilisateur
   */
  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      // Appeler l'API pour mettre à jour l'utilisateur
      try {
        const response = await fetch(buildApiUrl('/user/profile'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du profil');
        }
        
        const data = await response.json();
        
        if (data.user) {
          // Mettre à jour l'objet utilisateur avec les nouvelles données
          const updatedUser = { ...user, ...data.user };
          setUser(updatedUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          
          // Notifier les autres onglets/fenêtres
          window.dispatchEvent(new StorageEvent('storage', {
            key: USER_STORAGE_KEY,
            newValue: JSON.stringify(updatedUser)
          }));
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Détermine si l'utilisateur est un freelancer
   */
  const isFreelancer = useCallback(() => {
    return !!(user && (user.isFreelancer || user.role === 'freelance' || user.role === 'provider'));
  }, [user]);

  /**
   * Détermine la page de tableau de bord appropriée pour l'utilisateur
   */
  const getDashboardPath = useCallback(() => {
    if (!user) return '/login';
    
    return isFreelancer() ? '/dashboard/freelance' : '/dashboard/client';
  }, [user, isFreelancer]);

  /**
   * Méthode fiable pour rediriger l'utilisateur
   */
  const safeRedirect = useCallback((url: string) => {
    console.log(`🔀 Redirection vers: ${url}`);
    
    // Utiliser la fonction globale de redirection si disponible
    if (typeof window !== 'undefined' && typeof window.forceRedirect === 'function') {
      window.forceRedirect(url);
      return;
    }
    
    // Méthodes de fallback
    if (typeof window !== 'undefined') {
      try {
        // 1. Tenter avec replace
        window.location.replace(url);
      } catch (error) {
        console.error('Échec de redirection avec replace:', error);
        
        // 2. Tenter avec href comme fallback
        window.location.href = url;
      }
    }
  }, []);
  
  // Mettre à jour la méthode redirectToDashboard
  const redirectToDashboard = useCallback((router?: NextRouter, customUrl?: string) => {
    // Utiliser la nouvelle méthode de redirection
    if (customUrl) {
      safeRedirect(customUrl);
      return;
    }
    
    // Déterminer l'URL de redirection
    const url = getDashboardPath();
    safeRedirect(url);
  }, [safeRedirect, getDashboardPath]);

  // Valeur du contexte à fournir aux composants enfants
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    logout,
    register,
    updateUser,
    refreshAuthState,
    isFreelancer,
    getDashboardPath,
    redirectToDashboard
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};