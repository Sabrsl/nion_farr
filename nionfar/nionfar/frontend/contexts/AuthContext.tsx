import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';

// Clé constante pour le localStorage
const USER_STORAGE_KEY = 'nionfarUser';

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
  getDashboardPath: () => '/auth/login'
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
    const handleStorageChange = (e: StorageEvent) => {
      // Limiter le traitement uniquement à la clé de stockage utilisateur
      if (e.key === USER_STORAGE_KEY) {
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
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          throw new Error('Identifiants invalides');
        }
        
        const userData = await response.json();
        
        setUser(userData.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData.user));
        
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
        await fetch('/api/auth/logout', {
          method: 'POST'
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion côté serveur:', error);
      }
      
      localStorage.removeItem(USER_STORAGE_KEY);
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
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'inscription');
        }
        
        const data = await response.json();
        
        // Si l'inscription est réussie mais n'authentifie pas automatiquement
        if (data.success && !data.user) {
          return true;
        }
        
        // Si l'inscription authentifie automatiquement
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
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
        const response = await fetch('/api/user/profile', {
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
    return !!(user && (user.isFreelancer || user.role === 'provider'));
  }, [user]);

  /**
   * Détermine la page de tableau de bord appropriée pour l'utilisateur
   */
  const getDashboardPath = useCallback(() => {
    if (!user) return '/auth/login';
    
    return isFreelancer() ? '/dashboard/freelance' : '/dashboard/client';
  }, [user, isFreelancer]);

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
    getDashboardPath
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};