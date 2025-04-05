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
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  updateUser: async () => false,
  refreshAuthState: () => {}
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

  /**
   * Rafraîchit l'état d'authentification en récupérant les données utilisateur du localStorage
   */
  const refreshAuthState = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      
      // Mémoriser l'état précédent pour détecter les changements
      const wasAuthenticated = !!user;
      const userId = user?.id;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthContext] Refreshing auth state:', { 
          wasAuthenticated, 
          userId,
          storedUser: !!storedUser 
        });
      }
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[AuthContext] User data loaded from localStorage:', { 
              userId: userData.id,
              isNew: userId !== userData.id
            });
          }
          
          setUser(userData);
        } catch (e) {
          console.error('[AuthContext] Erreur lors du parsing des données utilisateur:', e);
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthContext] No user found in localStorage, clearing state');
        }
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Erreur lors du rafraîchissement de l\'état d\'authentification:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialisation du contexte au montage et gestion des changements de localStorage
  useEffect(() => {
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
    
    if (typeof window !== 'undefined') {
      // Écouter les changements de localStorage (pour les autres onglets)
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [refreshAuthState]);

  /**
   * Authentifie un utilisateur avec son email et mot de passe
   */
  const login = async (email: string, password: string, autoRedirect?: boolean, customUrl?: string) => {
    try {
      setLoading(true);
      
      // Pour la démonstration, on vérifie juste si l'email contient "test"
      if (email.includes('test')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Authentification simulée réussie pour:', email);
        }
        
        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          avatar: undefined,
          phone: undefined,
          role: 'client',
          isVerified: false,
        } as User;
        
        const userWithMeta = {
          ...mockUser,
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithMeta));
        
        return true;
      }
      
      return false;
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
      console.log('AuthContext: Déconnexion...');
      setLoading(true);
      // Ici, on pourrait appeler une API pour déconnecter l'utilisateur côté serveur
      
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('AuthContext: localStorage nettoyé');
      setUser(null);
      console.log('AuthContext: Utilisateur déconnecté');
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
      // Ici, on pourrait appeler une API pour inscrire l'utilisateur
      
      if (userData.email) {
        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          avatar: userData.avatar,
          phone: userData.phone,
          role: userData.role || 'client',
          isVerified: false,
        } as User;
        
        const userWithMeta = {
          ...mockUser,
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithMeta));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour les données de l'utilisateur courant
   */
  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      if (!user) {
        return false;
      }
      
      // Ici, on pourrait appeler une API pour mettre à jour le profil
      
      const updatedUser = { 
        ...user, 
        ...userData, 
        updatedAt: new Date().toISOString() 
      };
      
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Valeur du contexte à fournir aux composants enfants
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    logout,
    register,
    updateUser,
    refreshAuthState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};